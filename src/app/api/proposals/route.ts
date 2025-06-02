import { NextRequest, NextResponse } from 'next/server';
import { getVotingSystem } from '@/lib/utils';

export async function GET() {
    try {
        const votingSystem = await getVotingSystem();

        if (!votingSystem.contract) {
            return NextResponse.json(
                { error: 'Contract not initialized' },
                { status: 500 }
            );
        }

        const proposalCount = await votingSystem.contract.proposalCount();
        const proposals = [];

        for (let i = 0; i < proposalCount; i++) {
            const proposal = await votingSystem.contract.proposals(i);
            proposals.push({
                id: i,
                description: proposal.description,
                voteCount: proposal.voteCount.toString()
            });
        }

        return NextResponse.json(proposals);
    } catch (error: unknown) {
        console.error('Proposals API Error:', error);
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : String(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const votingSystem = await getVotingSystem();
        if (!votingSystem) {
            return NextResponse.json(
                { error: 'System not initialized' },
                { status: 500 }
            );
        }

        const { description } = await request.json();

        if (!description) {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        // Tambah proposal ke smart contract
        if (!votingSystem.contract) {
            return NextResponse.json(
                { error: 'Contract not initialized' },
                { status: 500 }
            );
        }
        const tx = await votingSystem.contract.addProposal(description);
        await tx.wait();

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            message: 'Proposal added successfully'
        });
    } catch (error: unknown) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : String(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}