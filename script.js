async function getBalance(tokenContract, stakingContract, walletAddress) {
  try {
    const tokenBalance = await tokenContract.balanceOf(walletAddress);
    const stakedInfo = await stakingContract.stakingInfos(walletAddress);
    const pendingReward = await stakingContract.pendingReward(walletAddress);

    document.getElementById(
      'user-balance'
    ).textContent = `Balance: ${ethers.formatUnits(
      tokenBalance,
      18
    )} BOKZ | Staked Balance: ${ethers.formatUnits(
      stakedInfo[0],
      18
    )} BOKZ | Pending Reward Balance: ${ethers.formatUnits(
      pendingReward,
      18
    )} BOKZ`;
    console.log('Balance fetched successfully.');
    return stakedInfo[0];
  } catch (error) {
    console.error('Error fetching balances:', error);
  }
}

async function stakeTokens(
  tokenContract,
  stakingContract,
  walletAddress,
  stakeAmount
) {
  try {
    const approveTx = await tokenContract.approve(
      stakingContract.target,
      stakeAmount
    );
    await approveTx.wait();
    console.log('Approval successful.');

    const stakeTx = await stakingContract.stake(stakeAmount);
    await stakeTx.wait();
    console.log('Tokens successfully staked!');

    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error staking tokens:', error);
  }
}

async function claimRewards(tokenContract, stakingContract, walletAddress) {
  try {
    const tx = await stakingContract.refreshPool();
    await tx.wait();
    console.log('Staking pool refreshed successfully!');
    const pendingReward = await stakingContract.pendingReward(walletAddress);
    console.log(`Pending Rewards: ${pendingReward} BOKZ`);

    const harvestTx = await stakingContract.harvest();
    await harvestTx.wait();
    console.log('Rewards successfully claimed!');

    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error claiming rewards:', error);
  }
}
async function startStaking(tokenContract, stakingContract, walletAddress) {
  try {
    const REWARD_TOKENS = ethers.parseUnits('5000', 18);
    const approveTx = await tokenContract.approve(
      stakingContract.target,
      REWARD_TOKENS
    );
    await approveTx.wait();
    console.log('Approval successful.');
    const tx = await stakingContract.startStaking(REWARD_TOKENS);
    await tx.wait();
    console.log('Staking started successfully!');

    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error claiming rewards:', error);
  }
}

async function withdrawTokens(tokenContract, stakingContract, walletAddress) {
  try {
    const withdrawAmount = await getBalance(
      tokenContract,
      stakingContract,
      walletAddress
    );
    console.log(
      `Withdrawing ${ethers.formatUnits(withdrawAmount, 18)} tokens...`
    );

    const withdrawTx = await stakingContract.unstake(withdrawAmount);
    await withdrawTx.wait();
    console.log('Tokens successfully withdrawn!');

    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error withdrawing tokens:', error);
  }
}

async function refreshStakingPool(
  tokenContract,
  stakingContract,
  walletAddress
) {
  try {
    console.log('Refreshing the staking pool...');
    const tx = await stakingContract.refreshPool();
    await tx.wait();
    console.log('Staking pool refreshed successfully!');
    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error refreshing staking pool:', error);
  }
}

async function main() {
  const TOKEN_ADDRESS = '0x9015957A2210BB8B10e27d8BBEEF8d9498f123eF';
  const STAKING_CONTRACT_ADDRESS = '0x9C6c49E1a5108eC5A2111c0b9B62624100d11e3a'; 
  const PRIVATE_KEY =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; 
  const HARDCODED_WALLET = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; 
  const tokenABI = [
    'function balanceOf(address account) public view returns (uint256)',
    'function approve(address spender, uint256 amount) public returns (bool)',
  ];

  const stakingABI = [
    'function stake(uint256 amount) public',
    'function pendingReward(address account) public view returns (uint256)',
    'function stakingInfos(address account) public view returns (uint256 stakedAmount, uint256 rewardDebt, uint256 totalAmountRewarded)',
    'function harvest() public',
    'function unstake(uint256 amount) public',
    'function startStaking(uint256 rewardTokens) external',
    'function refreshPool() external',
  ];

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const signer = await provider.getSigner(HARDCODED_WALLET);

  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet);
  const stakingContract = new ethers.Contract(
    STAKING_CONTRACT_ADDRESS,
    stakingABI,
    signer
  );

  document.getElementById('fetch-balance').addEventListener('click', () => {
    getBalance(tokenContract, stakingContract, wallet.address);
  });

  document.getElementById('stake-button').addEventListener('click', () => {
    const stakeAmount = document.getElementById('stake-amount').value;
    const stakeAmountInWei = ethers.parseUnits(stakeAmount, 18);
    stakeTokens(
      tokenContract,
      stakingContract,
      wallet.address,
      stakeAmountInWei
    );
  });

  document.getElementById('claim-rewards').addEventListener('click', () => {
    claimRewards(tokenContract, stakingContract, wallet.address);
  });

  document.getElementById('withdraw-tokens').addEventListener('click', () => {
    withdrawTokens(tokenContract, stakingContract, wallet.address);
  });
  document.getElementById('start-staking').addEventListener('click', () => {
    startStaking(tokenContract, stakingContract, wallet.address);
  });
  document.getElementById('refresh-pool').addEventListener('click', () => {
    refreshStakingPool(tokenContract, stakingContract, wallet.address);
  });
}

main()
  .then(() => console.log('Script loaded successfully'))
  .catch((error) => {
    console.error('Error initializing script:', error);
  });
