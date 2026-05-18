export function userGroupsTag(userId: string) {
  return `user:${userId}:groups`
}

export function groupMembersTag(groupId: string) {
  return `group:${groupId}:members`
}

export function groupPerformanceTag(groupId: string) {
  return `group:${groupId}:performance`
}

export function proposalTag(proposalId: string) {
  return `proposal:${proposalId}`
}

export function consensusStockTag(consensusStockId: string) {
  return `consensus:${consensusStockId}`
}
