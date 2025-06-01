import { VotingSystem } from './voting-system';

let votingSystemInstance: VotingSystem | null = null;

export async function getVotingSystem(): Promise<VotingSystem> {
    if (!votingSystemInstance) {
        votingSystemInstance = new VotingSystem();
        await votingSystemInstance.initializeContract();
    }
    return votingSystemInstance;
}