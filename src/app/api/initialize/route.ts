import { NextResponse } from 'next/server';
import { VotingSystem } from '@/lib/voting-system';
import { getVotingSystem } from '@/lib/utils';

export async function POST() {
    try {
        let votingSystem = await getVotingSystem();
        if (!votingSystem) {
            votingSystem = new VotingSystem();
            await votingSystem.loadModels();
            await votingSystem.initializeContract();
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
