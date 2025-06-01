import { NextRequest, NextResponse } from 'next/server';
import { VotingSystem } from '@/lib/voting-system';
import { getVotingSystem } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        let votingSystem = await getVotingSystem();
        if (!votingSystem) {
            votingSystem = new VotingSystem();
            await votingSystem.loadModels();
            await votingSystem.initializeContract();
        }
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
}
