(async function () {
  const MySmartContract = {
    contractAddress: '0x3126BAB537896809Bb8D60c0970D58C44D77D348',
    contractABI: [
      {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ],
    provider: null,
    contract: null,

    init: async function () {
      console.log('Smart contract interaction initialized.');

      if (!window.ethereum) {
        console.error('MetaMask is not installed!');
        return;
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send('eth_requestAccounts', []);

      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      const walletAddress = localStorage.getItem('wallet');
      if (walletAddress) {
        await this.fetchBalance(walletAddress);
      } else {
        console.warn('No wallet address found in storage.');
      }
    },

    fetchBalance: async function (walletAddress) {
      try {
        const balance = await this.contract.balanceOf(walletAddress);
        const formattedBalance = ethers.utils.formatEther(balance);
        console.log(`User balance: ${formattedBalance}`);

        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
          balanceElement.textContent = `${formattedBalance} Tokens`;
        } else {
          console.warn('Element with ID "user-balance" not found.');
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    },
  };

  await MySmartContract.init();
})();
