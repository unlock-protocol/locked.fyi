pragma solidity 0.5.17;

interface IReward {

  /**
     * @dev This function creates a reward instance to be added to the rewards array. ID's
     *      are assigned the new intance's index of that array
     * @param _description description of the reward
     * @param _isMerit Recurring dividend reward or one-off merit reward
     * @param _referenceToken the token used to calculate reward distributions for each holder. Must be an instance of minime token as used by aragon Dao.
     * @param _rewardToken currency received as reward, accepts address 0 for ETH reward
     * @param _amount the reward amount to be distributed
     * @param _startBlock block in which token transactions will begin to be tracked
     * @param _duration the block duration over which reference token earnings are calculated
     * @param _occurrences the number of occurrences of a dividend reward
     * @param _delay the number of blocks to delay after the end of the period that the reward can be claimed
     * @return rewardId of the newly created Reward
     */
    function newReward(
        string calldata _description,
        bool _isMerit,
        address _referenceToken,
        address _rewardToken,
        uint256 _amount,
        uint64 _startBlock,
        uint64 _duration,
        uint8 _occurrences,
        uint64 _delay
    ) external returns (uint256 rewardId);
}
