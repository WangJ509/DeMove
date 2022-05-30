import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-sdk";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { LedgerSigner } from "@taquito/ledger-signer";

type ButtonProps = {
  Tezos: TezosToolkit;
  setContract: Dispatch<SetStateAction<any>>;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setStorage: Dispatch<SetStateAction<any>>;
  contractAddress: string;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  wallet: BeaconWallet;
};

const ConnectButton = ({
  Tezos,
  setContract,
  setWallet,
  setUserAddress,
  setUserBalance,
  setStorage,
  contractAddress,
  setBeaconConnection,
  setPublicToken,
  wallet
}: ButtonProps): JSX.Element => {

  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);
    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());
    // creates contract instance
    const contract = await Tezos.wallet.at(contractAddress);
    const storage: any = await contract.storage();
    setContract(contract);
    //setStorage(storage);
  };

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.ITHACANET,
          rpcUrl: "https://ithacanet.smartpy.io/"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      // creates a wallet instance
      if (!wallet) {
        const newWallet = new BeaconWallet({
          name: "Taquito Boilerplate",
          preferredNetwork: NetworkType.ITHACANET,
          disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
          eventHandlers: {
            // To keep the pairing alert, we have to add the following default event handlers back
            [BeaconEvent.PAIR_INIT]: {
              handler: defaultEventCallbacks.PAIR_INIT
            },
            [BeaconEvent.PAIR_SUCCESS]: {
              handler: data => setPublicToken(data.publicKey)
            }
          }
        });
        Tezos.setWalletProvider(newWallet);
        setWallet(newWallet);
        wallet = newWallet;
      }
      // checks if wallet was connected before
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        setBeaconConnection(true);
      }
    })();
  }, []);

  return (
    <button className="button" onClick={connectWallet}>
      <span>
        <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
      </span>
    </button>
  );
};

export default ConnectButton;
