'use client';

import { Loader, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface Proposal {
    id: number;
    description: string;
    voteCount: string;
}


export default function Voting() {
    const webcamRef = useRef<Webcam>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isVoting, setIsVoting] = useState(false);
    const [message, setMessage] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
    const [isVotingWaiting, setIsVotingWaiting] = useState(false);
    const [isCameraAvailable, setIsCameraAvailable] = useState(false);
    const [isVoted, setIsVoted] = useState(false);
    const [isVoteFailed, setIsVoteFailed] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // Initialize system
    const initializeSystem = useCallback(async () => {
        try {
            setMessage('Initializing system...');
            const response = await fetch('/api/initialize', {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsInitialized(true);
                setMessage('System initialized successfully');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.error || 'Failed to initialize system');
            }
        } catch (error) {
            console.error('Initialize error:', error);
            setMessage('Error initializing system');
        }
    }, []);

    // Load proposals
    const loadProposals = useCallback(async () => {
        if (!isInitialized) return;

        try {
            const response = await fetch('/api/proposals');
            if (response.ok) {
                const data = await response.json();
                setProposals(data);
            } else {
                const error = await response.json();
                setMessage(error.error || 'Error loading proposals');
            }
        } catch (error) {
            console.error('Load proposals error:', error);
            setMessage('Error loading proposals');
        }
    }, [isInitialized]);

    // Submit vote - hanya kirim base64 image
    const submitVote = async (proposalId: number) => {
        if (!webcamRef.current) {
            setMessage('Camera not available');
            return;
        }

        setIsVoting(true);
        setMessage('Capturing and processing your face...');

        try {
            // Capture image
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) {
                throw new Error('Failed to capture image from camera');
            }

            // Extract base64 data (remove data:image/jpeg;base64, prefix)
            const base64Image = imageSrc.split(',')[1];

            setMessage('Sedang memproses voting...');

            // Send to server for processing
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    proposalId: proposalId
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage(`Voting berhasil! Terima kasih telah berpartisipasi. TX: ${result.txHash.substring(0, 10)}...`);
                setIsVoted(true);
                setIsVoteFailed(false);
                loadProposals(); // Refresh proposal counts
            } else {
                setIsVoted(true);
                setIsVoteFailed(true);
                setMessage(result.error || 'Error submitting vote');
            }

        } catch (error: any) {
            console.error('Vote submission error:', error);
            setMessage('Error: ' + error.message);
        }

        setIsVoting(false);
    };

    // Add proposal function
    const addProposal = async (description: string) => {
        if (!description.trim()) {
            setMessage('Please enter a proposal description');
            return;
        }

        try {
            setMessage('Adding proposal...');

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('Proposal added successfully!');
                loadProposals(); // Refresh proposals
            } else {
                setMessage(result.error || 'Error adding proposal');
            }
        } catch (error: any) {
            console.error('Add proposal error:', error);
            setMessage('Error: ' + error.message);
        }
    };

    useEffect(() => {
        initializeSystem();
    }, [initializeSystem]);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);

    return (
        <div className="flex flex-col items-center justify-center h-[100dvh] bg-gray-900">
            {(!isInitialized && proposals.length === 0) && (
                <Loader className="animate-spin text-white" size={48} />
            ) || (
                    <div className="w-full h-full max-w-[80dvw] flex flex-col items-center justify-center">
                        {process.env.NEXT_PUBLIC_ADMIN_PANEL && (
                            <>
                                <button
                                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 cursor-pointer"
                                    title="Toggle Admin Panel"
                                    aria-label="Toggle Admin Panel"
                                >
                                    {showAdminPanel ? 'x' : 'A'}
                                </button>

                                {showAdminPanel && (
                                    <div className="absolute top-16 right-4 bg-white text-black p-4 rounded-lg shadow-lg w-80">
                                        <h2 className="text-xl font-semibold mb-2 text-center">Admin Panel</h2>
                                        <textarea
                                            placeholder="Masukkan judul voting..."
                                            className="w-full p-2 border rounded-lg mb-2"
                                            rows={3}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                        <button
                                            onClick={() => addProposal(message)}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                        >
                                            Tambahkan
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="w-full flex items-center justify-center text-white">
                            {proposals.map((proposal, index) => (
                                <button
                                    key={proposal.id}
                                    className={`p-5 w-200 h-30 text-center ${index === 0 ? 'rounded-l-4xl' : ''} ${index === proposals.length - 1 ? 'rounded-r-4xl' : ''} ${selectedProposal?.id === proposal.id ? 'bg-blue-600' : 'bg-gray-500 hover:bg-blue-500'} transition-colors duration-200`}
                                    onClick={() => {
                                        setIsVoted(false);
                                        setSelectedProposal(proposal)
                                    }}
                                >
                                    <p className="text-[10px] md:text-xl font-semibold">({proposal.voteCount})</p>
                                    <h3 className="text-xs md:text-2xl font-semibold">{proposal.description}</h3>
                                </button>
                            ))}
                        </div>

                        {selectedProposal && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsVotingModalOpen(true)}
                                    className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    Vote
                                </button>
                            </div>
                        )}

                        {isVotingModalOpen && (
                            <div className="w-screen h-screen fixed top-0 left-0 bg-black/30 flex items-center justify-center z-50">
                                <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                    <button
                                        onClick={() => setIsVotingModalOpen(false)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <h2 className="text-2xl font-semibold mb-4 text-center">Pindai Wajah</h2>
                                    <p className="text-xs text-center mb-4">Pastikan wajah Anda terlihat jelas sebelum melanjutkan proses.</p>
                                    <div className="flex items-center justify-center">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            width={320}
                                            height={240}
                                            className="mb-4 rounded-lg"
                                            onUserMedia={() => setIsCameraAvailable(true)}
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => {
                                                if (selectedProposal) {
                                                    submitVote(selectedProposal.id);
                                                }
                                                setIsCameraAvailable(false);
                                                setIsVotingModalOpen(false);
                                                setIsVotingWaiting(true);
                                            }}
                                            disabled={isVoting || !isCameraAvailable}
                                            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ${(isVoting || !isCameraAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isVoting ? 'Voting...' : 'Lakukan Voting'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {isVotingWaiting && (
                <div className="w-screen h-screen fixed top-0 left-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center flex flex-col items-center">
                        {(isVoted) && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsVotingWaiting(false);
                                        setIsVoted(false);
                                        setIsVoteFailed(false);
                                        setSelectedProposal(null);
                                    }}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                    title="Tutup"
                                    aria-label="Tutup"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                {!isVoteFailed ? (
                                    <p className="text-green-500 text-2xl font-semibold">
                                        Voting berhasil! Terima kasih telah berpartisipasi.
                                    </p>
                                ) : (
                                    <p className="text-red-500 text-2xl font-semibold">
                                        Voting gagal! <br /><br /> {message || 'Mungkin anda sudah melakukan voting sebelumnya atau ada masalah teknis.'}
                                    </p>
                                )}
                            </>
                        ) || (
                                <>
                                    <Loader className="animate-spin text-blue-500 mb-4" size={48} />
                                    <h2 className="text-xl font-semibold mb-2">Sedang memproses voting...</h2>
                                    <p className="text-gray-600">Mohon tunggu beberapa saat.</p>
                                </>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}