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
    const pendingReward = await stakingContract.pendingReward(walletAddress);
    console.log(`Pending Rewards: ${pendingReward} BOKZ`);

    const approveTx = await tokenContract.approve(
      stakingContract.target,
      pendingReward + pendingReward
    );
    await approveTx.wait();
    console.log('Approval successful.');

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

async function initializeApp(walletAddress) {
  const TOKEN_ADDRESS = '0x3Af51A117e726d33737CE632D56Dc520B668000E';
  const STAKING_CONTRACT_ADDRESS = '0xAdCF2Bff4B107c5B5e02845E9DE713406e2A2f53';
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
  ];

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  console.log(`Initializing contracts for wallet: ${walletAddress}`);

  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, signer);
  const stakingContract = new ethers.Contract(
    STAKING_CONTRACT_ADDRESS,
    stakingABI,
    signer
  );

  document.getElementById(
    'user-address'
  ).textContent = `Address: ${walletAddress}`;

  getBalance(tokenContract, stakingContract, walletAddress);

  document.getElementById('fetch-balance').addEventListener('click', () => {
    getBalance(tokenContract, stakingContract, walletAddress);
  });

  document.getElementById('stake-button').addEventListener('click', () => {
    const stakeAmount = document.getElementById('stake-amount').value;
    const stakeAmountInWei = ethers.parseUnits(stakeAmount, 18);
    stakeTokens(
      tokenContract,
      stakingContract,
      walletAddress,
      stakeAmountInWei
    );
  });

  document.getElementById('claim-rewards').addEventListener('click', () => {
    claimRewards(tokenContract, stakingContract, walletAddress);
  });

  document.getElementById('withdraw-tokens').addEventListener('click', () => {
    withdrawTokens(tokenContract, stakingContract, walletAddress);
  });

  document.getElementById('start-staking').addEventListener('click', () => {
    startStaking(tokenContract, stakingContract, walletAddress);
  });
}

async function connectWallet() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();

    localStorage.setItem('address', walletAddress);

    console.log(`Wallet connected: ${walletAddress}`);
    initializeApp(walletAddress);
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
}

async function main() {
  const walletInStorage = localStorage.getItem('address');

  if (walletInStorage) {
    console.log(`Using saved wallet: ${walletInStorage}`);
    initializeApp(walletInStorage);
  } else {
    console.log('No wallet connected. Please connect.');
    document
      .getElementById('connect-wallet')
      .addEventListener('click', connectWallet);
  }
}

main().catch((error) => {
  console.error('Error initializing application:', error);
});
