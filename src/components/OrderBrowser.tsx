import React from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import ContractButton from "./ContractButton";

type OrderBrowserProps = {
  storage: any;
  buttonType: string;
  orderFilter: any;
  displayItems: any;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const OrderBrowser = ({
  storage,
  buttonType,
  orderFilter,
  displayItems,
  contract,
  Tezos,
}: OrderBrowserProps): JSX.Element => {

  const generateOrderArray = (data : any) => {
    const orders = data.orders.map((x : any) => {
      const order = {hash_b: x.data.key.value};
      for (let y in x.data.value.children) {
        const z = x.data.value.children[y];
        // @ts-ignore
        order[z.name] = z.value;
      }
      return order;
    });

    return orders.filter(orderFilter);
  };

  const generateOrderList = (data : any) => {
    if (!data) {
      return <p>Sorry, the data are not ready yet!</p>;
    }
    const orders = generateOrderArray(data);
    return orders.map((order : any) => (
      <div key={order.hash_b} style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{textAlign: 'left'}}>
          <p><i className="fas fa-list"></i>&nbsp; <b>{order.product_name}</b></p>
          {displayItems(order).map((x : any, index : number) => <p key={index}>{x}</p>)}
        </div>
        <div style={{textAlign: 'right'}}>
          {buttonType == 'seller' &&
            <ContractButton contract={contract} Tezos={Tezos} contractMethod="accept_order" getArgs={async () => {
              const args = [order.hash_b, undefined];
              const key = prompt("Enter your key");
              if (key) {
                const encoder = new TextEncoder();
                const hash = await crypto.subtle.digest('SHA-256', encoder.encode(key)); 
                const hashArray = Array.from(new Uint8Array(hash));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                args[1] = hashHex;
              }
              return args;
            }}>
              Accept
            </ContractButton>
          }
          {buttonType == 'buyer' &&
            <ContractButton contract={contract} Tezos={Tezos} contractMethod="finish_order_buyer" getArgs={async () => {
              const args = [order.hash_b, undefined];
              const key = prompt("Enter seller's key");
              if (key) {
                args[1] = char2Bytes(key);
              }
              return args;
            }}>
              Finish
            </ContractButton>
          }
          {buttonType == 'available' &&
            <ContractButton contract={contract} Tezos={Tezos} contractMethod="accept_delivery" getArgs={async () => [order.hash_b]} getAmount={(args : any) => Number(order.product_price) / 1000000}>
              Accept
            </ContractButton>
          }
          {buttonType == 'deliveryman' &&
            <ContractButton contract={contract} Tezos={Tezos} contractMethod="finish_order_deliver" getArgs={async () => {
              const args = [order.hash_b, undefined];
              const key = prompt("Enter buyer's key");
              if (key) {
                args[1] = char2Bytes(key);
              }
              return args;
            }}>
              Finish
            </ContractButton>
          }
        </div>
      </div>
    ));
  };

  return (
    <div>
      {generateOrderList(storage)}
    </div>
  );
};

export default OrderBrowser;
