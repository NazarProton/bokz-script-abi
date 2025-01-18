async function getBalance(tokenContract, stakingContract, walletAddress) {
  try {
    const tokenBalance = await tokenContract.balanceOf(walletAddress);
    const stakedInfo = await stakingContract.stakingInfos(walletAddress);
    const pendingReward = await stakingContract.pendingReward(walletAddress);

    document.getElementById('user-balance').textContent = `${Number(
      ethers.formatUnits(tokenBalance, 18)
    ).toFixed(2)}`;

    document.getElementById('staked-balance').textContent = `${Number(
      ethers.formatUnits(stakedInfo[0], 18)
    ).toFixed(2)}`;
    document.getElementById('claim-balance').textContent = `${Number(
      ethers.formatUnits(pendingReward, 18)
    ).toFixed(2)}`;

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
    const harvestTx = await stakingContract.harvest();
    await harvestTx.wait();
    console.log('Rewards successfully claimed!');

    await getBalance(tokenContract, stakingContract, walletAddress);
  } catch (error) {
    console.error('Error claiming rewards:', error);
  }
}

async function withdrawTokens(tokenContract, stakingContract, walletAddress) {
  try {
    const withdrawAmount = document.getElementById('AMOUNT-UNSTAKE').value;
    const formattedAmount = ethers.parseUnits(withdrawAmount, 18);

    console.log(`Withdrawing ${withdrawAmount} tokens...`);

    const withdrawTx = await stakingContract.unstake(formattedAmount);
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

  getBalance(tokenContract, stakingContract, walletAddress);

  document.getElementById('stake-button').addEventListener('click', () => {
    const stakeAmount = document.getElementById('AMOUNT-STAKE').value;
    const stakeAmountInWei = ethers.parseUnits(stakeAmount, 18);
    stakeTokens(
      tokenContract,
      stakingContract,
      walletAddress,
      stakeAmountInWei
    );
  });

  document.getElementById('claim').addEventListener('click', () => {
    claimRewards(tokenContract, stakingContract, walletAddress);
  });

  document.getElementById('withdraw-tokens').addEventListener('click', () => {
    withdrawTokens(tokenContract, stakingContract, walletAddress);
  });
}

function startWalletChecker(interval = 500) {
  const intervalId = setInterval(() => {
    const walletInStorage = localStorage.getItem('address');

    if (walletInStorage) {
      console.log(`Wallet detected: ${walletInStorage}. Initializing app...`);
      initializeApp(walletInStorage);
      clearInterval(intervalId);
      addDisconnectListener();
    }
  }, interval);
}

function addDisconnectListener() {
  setTimeout(() => {
    const disconnectButton = document.querySelector(
      'button.square-button.w-button'
    );
    if (disconnectButton) {
      disconnectButton.addEventListener('click', () => {
        console.log('Wallet disconnected. Restarting wallet checker...');
        localStorage.removeItem('address');
        startWalletChecker();
      });
    } else {
      console.log('No disconnect button found.');
    }
  }, 2000);
}

async function main() {
  const walletInStorage = localStorage.getItem('address');

  if (walletInStorage) {
    console.log(`Using saved wallet: ${walletInStorage}`);
    initializeApp(walletInStorage);
    addDisconnectListener();
  } else {
    console.log('No wallet detected. Starting wallet checker...');
    startWalletChecker();
  }
}

main().catch((error) => {
  console.error('Error initializing application:', error);
});
