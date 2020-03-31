import { gql } from 'apollo-boost'

export default function locksByOwner() {
  return gql`
    query Locks($owner: String!) {
      locks(
        where: { owner: $owner }
        orderBy: creationBlock
        orderDirection: desc
      ) {
        address
        name
      }
    }
  `
}
