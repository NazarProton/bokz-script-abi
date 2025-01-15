(async function () {
  // Глобальний об'єкт
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

    init: function () {
      console.log('Smart contract interaction initialized.');
      this.setupEventListeners();
      this.checkAndFetchBalance();
    },

    setupEventListeners: function () {
      window.addEventListener('storage', (event) => {
        if (event.key === 'address' && event.newValue) {
          this.checkAndFetchBalance();
        }
      });
    },

    async checkAndFetchBalance() {
      const walletAddress = localStorage.getItem('address');
      if (!walletAddress) {
        console.warn('No wallet connected in storage.');
        this.updateBalance('0');
        return;
      }

      console.log(`Wallet detected in storage: ${walletAddress}`);
      try {
        // Initialize provider and contract if not already done
        if (!this.provider) {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          this.contract = new ethers.Contract(
            this.contractAddress,
            this.contractABI,
            this.provider
          );
        }

        // Fetch balance from the smart contract
        const balance = await this.contract.balanceOf(walletAddress);
        const formattedBalance = ethers.utils.formatEther(balance);

        console.log(`User balance: ${formattedBalance}`);
        this.updateBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        this.updateBalance('Error');
      }
    },

    updateBalance: function (balance) {
      const balanceElement = document.getElementById('user-balance');
      if (balanceElement) {
        balanceElement.textContent = balance;
      } else {
        console.warn('Element with ID "user-balance" not found.');
      }
    },
  };

  // Автоматично викликаємо ініціалізацію
  MySmartContract.init();
})();
