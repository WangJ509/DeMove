import React, { useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface ContractButtonProps {
  contract: WalletContract | any;
  Tezos: TezosToolkit;
  contractMethod: string;
  getArgs?: any;
  getAmount?: any;
  children: React.ReactNode;
}

const ContractButton = ({ contract, Tezos, contractMethod, getArgs, getAmount, children }: ContractButtonProps) => {
  const [waitingTransaction, setWaitingTransaction] = useState<boolean>(false);

  const doTransaction = async (): Promise<void> => {
    const args = getArgs ? await getArgs() : [];
    setWaitingTransaction(true);
    try {
      let op;
      if (getAmount)
        op = await contract.methods[contractMethod](...args).send({amount: getAmount(args)});
      else
        op = await contract.methods[contractMethod](...args).send();
      await op.confirmation();
    } catch (error) {
      console.log(error);
    } finally {
      setWaitingTransaction(false);
    }
  };

  return (
    <button className="button" disabled={waitingTransaction} onClick={doTransaction}>
      {waitingTransaction ? (
        <span>
          <i className="fas fa-spinner fa-spin"></i>&nbsp; Please wait
        </span>
      ) : (
        <span>
          {children}
        </span>
      )}
    </button>
  );
};

export default ContractButton;
