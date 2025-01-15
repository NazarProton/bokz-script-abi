(async function () {
  const contractAddress = '0x3126BAB537896809Bb8D60c0970D58C44D77D348';
  const contractABI = [
    {
      constant: true,
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      type: 'function',
    },
  ];

  const updateBalance = async () => {
    try {
      const walletAddress = localStorage.getItem('address');

      if (!walletAddress) {
        console.warn('No wallet address found in storage.');
        updateBalanceElement('0');
        return;
      }

      console.log('Wallet detected in storage:', walletAddress);

      const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        walletAddress
      );
      console.log(contract);

      console.log('Fetching balance for:', walletAddress);

      const balance = await contract.balanceOf(walletAddress);
      const formattedBalance = ethers.formatEther(balance);

      console.log(`Balance for ${walletAddress}: ${formattedBalance}`);
      updateBalanceElement(formattedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error.message);
      updateBalanceElement('Error');
    }
  };

  const updateBalanceElement = (balance) => {
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
      balanceElement.textContent = `${balance} ETH`;
    } else {
      console.warn('Element with ID "user-balance" not found.');
    }
  };

  const init = async () => {
    console.log('Smart contract interaction initialized.');
    await updateBalance();

    window.addEventListener('storage', (event) => {
      if (event.key === 'address') {
        console.log(`Address changed in storage: ${event.newValue}`);
        updateBalance();
      }
    });
  };

  await init();
})();
