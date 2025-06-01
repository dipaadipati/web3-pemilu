import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import { ethers } from 'ethers';
import crypto from 'crypto';
import path from 'path';

// Monkey patch untuk server-side - pastikan ini di server
if (typeof window === 'undefined') {
    // @ts-ignore
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
}

export class VotingSystem {
    private faceDescriptors: Map<string, Float32Array> = new Map();
    public contract: any = null;
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;
    private modelsLoaded: boolean = false;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');

        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY environment variable is required");
        }

        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log("VotingSystem initialized with signer:", this.signer.address);
    }

    async initializeContract() {
        const contractABI = [
            "function voters(string) public view returns (bool hasVoted, string faceHash, uint256 voteTimestamp)",
            "function proposals(uint256) public view returns (string description, uint256 voteCount)",
            "function proposalCount() public view returns (uint256)",
            "function admin() public view returns (address)",
            "function vote(string memory _faceHash, uint256 _proposalId) public",
            "function addProposal(string memory _description) public",
        ];

        try {
            this.contract = new ethers.Contract(
                process.env.CONTRACT_ADDRESS!,
                contractABI,
                this.signer
            );

            // Verify admin
            const adminAddress = await this.contract.admin();
            console.log("Contract admin:", adminAddress);
            console.log("Current signer:", this.signer.address);

            if (adminAddress.toLowerCase() !== this.signer.address.toLowerCase()) {
                throw new Error(`Access denied. Contract admin is ${adminAddress}, but current signer is ${this.signer.address}`);
            }

            const proposalCount = await this.contract.proposalCount();
            console.log(`Contract connected successfully. Current proposal count: ${proposalCount}`);

        } catch (error) {
            console.error("Failed to initialize contract:", error);
            throw error;
        }
    }

    async loadModels() {
        if (this.modelsLoaded) {
            console.log("Models already loaded");
            return;
        }

        try {
            const modelsPath = path.join(process.cwd(), 'public', 'models');
            console.log("Loading face-api models from:", modelsPath);

            await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
            await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
            await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

            this.modelsLoaded = true;
            console.log("Face-API models loaded successfully");
        } catch (error) {
            console.error("Failed to load face models:", error);
            throw new Error(`Failed to load face recognition models: ${error}`);
        }
    }

    generateFaceHash(descriptor: Float32Array): string {
        const descriptorString = Array.from(descriptor).join(',');
        return crypto.createHash('sha256').update(descriptorString).digest('hex');
    }

    async extractFaceDescriptor(imageBuffer: Buffer): Promise<Float32Array> {
        try {
            console.log("Processing image buffer, size:", imageBuffer.length);

            // Pastikan models sudah loaded
            if (!this.modelsLoaded) {
                await this.loadModels();
            }

            // Load image menggunakan Canvas - pastikan di server-side
            const img = await loadImage(imageBuffer);
            console.log("Image loaded successfully, dimensions:", img.width, 'x', img.height);

            const detection = await faceapi
                .detectSingleFace(img as any)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                throw new Error('No face detected in the image. Please ensure your face is clearly visible and well-lit.');
            }

            console.log("Face detected and descriptor extracted successfully");
            return detection.descriptor;

        } catch (error) {
            console.error("Face extraction error:", error);
            throw new Error(`Face processing failed: ${error}`);
        }
    }

    async checkExistingFace(newDescriptor: Float32Array, threshold: number = 0.6): Promise<string | null> {
        for (let [hash, descriptor] of this.faceDescriptors) {
            const distance = faceapi.euclideanDistance(newDescriptor, descriptor);
            console.log(`Comparing with existing face, distance: ${distance}`);
            if (distance < threshold) {
                return hash;
            }
        }
        return null;
    }

    async addProposal(description: string) {
        try {
            console.log(`Adding proposal: ${description}`);

            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const gasEstimate = await this.contract.addProposal.estimateGas(description);
            console.log(`Estimated gas: ${gasEstimate}`);

            const tx = await this.contract.addProposal(description, {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100)
            });

            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`Transaction confirmed: ${receipt.transactionHash}`);

            return {
                success: true,
                txHash: tx.hash,
                gasUsed: receipt.gasUsed?.toString()
            };
        } catch (error: any) {
            console.error("Error adding proposal:", error);

            if (error.message?.includes('Only admin')) {
                throw new Error('Only admin can add proposals. Check if you are using the correct admin address.');
            }

            throw new Error(`Failed to add proposal: ${error.message}`);
        }
    }

    async processVote(imageBuffer: Buffer, proposalId: number) {
        try {
            console.log(`Processing vote for proposal ${proposalId}`);

            // Extract face descriptor
            const descriptor = await this.extractFaceDescriptor(imageBuffer);

            // Check if face already voted
            const existingHash = await this.checkExistingFace(descriptor);

            if (existingHash) {
                console.log("Existing face found, checking blockchain...");
                const voter = await this.contract.voters(existingHash);
                if (voter.hasVoted) {
                    throw new Error('Wajah ini sudah memberikan suara sebelumnya. Hanya satu suara per wajah yang diperbolehkan.');
                }
            }

            // Generate unique hash for this face
            const faceHash = this.generateFaceHash(descriptor);
            this.faceDescriptors.set(faceHash, descriptor);

            console.log(`Submitting vote with face hash: ${faceHash.substring(0, 10)}...`);

            // Estimate gas and submit vote
            const gasEstimate = await this.contract.vote.estimateGas(faceHash, proposalId);
            const tx = await this.contract.vote(faceHash, proposalId, {
                gasLimit: gasEstimate * BigInt(120) / BigInt(100)
            });

            console.log(`Vote transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`Vote confirmed: ${receipt.transactionHash}`);

            return {
                success: true,
                txHash: tx.hash,
                faceHash: faceHash,
                gasUsed: receipt.gasUsed?.toString()
            };

        } catch (error: any) {
            console.error("Vote processing error:", error);
            throw error;
        }
    }
}