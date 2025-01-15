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

      // Check if ethers.js is loaded
      if (typeof ethers === 'undefined' || !ethers.providers) {
        console.error('Ethers.js is not loaded or providers are unavailable.');
        return;
      }

      // Check if MetaMask (or other Ethereum provider) is installed
      if (!window.ethereum) {
        console.error('MetaMask is not installed!');
        return;
      }

      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      await this.provider.send('eth_requestAccounts', []);

      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.provider
      );

      // Check localStorage for wallet address
      const walletAddress = localStorage.getItem('address');
      if (walletAddress) {
        console.log(`Wallet found in storage: ${walletAddress}`);
        await this.fetchBalance(walletAddress);
      } else {
        console.warn('No wallet address found in localStorage.');
        this.updateBalance('0');
      }

      // Watch for changes in localStorage
      this.setupStorageListener();
    },

    setupStorageListener: function () {
      window.addEventListener('storage', async (event) => {
        if (event.key === 'address' && event.newValue) {
          console.log(`New wallet detected in storage: ${event.newValue}`);
          await this.fetchBalance(event.newValue);
        }
      });
    },

    fetchBalance: async function (walletAddress) {
      try {
        const balance = await this.contract.balanceOf(walletAddress);
        const formattedBalance = ethers.utils.formatEther(balance);
        console.log(
          `Balance fetched for wallet ${walletAddress}: ${formattedBalance}`
        );
        this.updateBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        this.updateBalance('Error');
      }
    },

    updateBalance: function (balance) {
      const balanceElement = document.getElementById('user-balance');
      if (balanceElement) {
        balanceElement.textContent = `${balance} Tokens`;
      } else {
        console.warn('Element with ID "user-balance" not found.');
      }
    },
  };

  await MySmartContract.init();
})();
