document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ethers === 'undefined' || !window.ethereum) {
    console.error('Ethers.js or Ethereum provider is not available.');
    return;
  }

  console.log('Initializing...');

  // Ініціалізація нового BrowserProvider
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  console.log('Connected wallet:', address);

  const contract = new ethers.Contract(
    '0x3126BAB537896809Bb8D60c0970D58C44D77D348', // Адреса контракту
    [
      {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        type: 'function',
      },
    ], // ABI контракту
    signer // Підписувач
  );
  console.log(contract); // Має повернути об'єкт контракту

  try {
    const balance = await contract.balanceOf(address);
    console.log('Balance:', ethers.formatEther(balance));

    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
      balanceElement.textContent = `${ethers.formatEther(balance)} Tokens`;
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
});
