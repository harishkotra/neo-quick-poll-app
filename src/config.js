import { ethers } from 'ethers';
import contractABI from './contractABI.json';

export const CONTRACT_ADDRESS = "0xA3A586e410164140D9e71C8B0eD460a95A239513";
export const CONTRACT_ABI = contractABI;

export async function getContract() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  throw new Error("Please install MetaMask!");
}