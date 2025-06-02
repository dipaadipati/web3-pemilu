import { NextRequest, NextResponse } from 'next/server';
import { getVotingSystem } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const votingSystem = await getVotingSystem();
        if (!votingSystem) {
            return NextResponse.json(
                { error: 'System not initialized' },
                { status: 500 }
            );
        }

        const { image, proposalId } = await request.json();
        const imageBuffer = Buffer.from(image, 'base64');

        const result = await votingSystem.processVote(imageBuffer, proposalId);
        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}