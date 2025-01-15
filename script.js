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
    signer: null,
    contract: null,

    init: async function () {
      console.log('Smart contract interaction initialized.');

      // Перевірка наявності бібліотеки ethers.js
      if (typeof ethers === 'undefined') {
        console.error('Ethers.js is not loaded.');
        return;
      }

      // Перевірка наявності MetaMask
      if (!window.ethereum) {
        console.error('MetaMask is not installed!');
        return;
      }

      try {
        // Ініціалізація провайдера та підписувача
        this.provider = new ethers.BrowserProvider(window.ethereum);
        await this.provider.send('eth_requestAccounts', []);
        this.signer = await this.provider.getSigner();
        console.log('Signer initialized:', await this.signer.getAddress());

        // Ініціалізація контракту
        this.contract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          this.signer
        );
        console.log('Contract initialized:', this.contract.address);

        // Перевірка наявності адреси гаманця у localStorage
        const walletAddress = localStorage.getItem('address');
        if (walletAddress) {
          console.log(`Wallet found in storage: ${walletAddress}`);
          await this.fetchBalance(walletAddress);
        } else {
          console.warn('No wallet address found in localStorage.');
          this.updateBalance('0');
        }

        // Слухач змін у localStorage
        this.setupStorageListener();
      } catch (error) {
        console.error('Error initializing contract:', error.message);
      }
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
        // Перевірка доступності контракту та адреси
        if (!this.contract) {
          throw new Error('Contract is not initialized.');
        }

        if (!ethers.utils.isAddress(walletAddress)) {
          throw new Error('Invalid wallet address.');
        }

        // Отримання балансу
        const balance = await this.contract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatEther(balance);
        console.log(`Balance for ${walletAddress}: ${formattedBalance}`);
        this.updateBalance(formattedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error.message);
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
