import React, { useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import OrderBrowser from "./OrderBrowser";

type DeliverymanPageProps = {
  children: React.ReactNode;
  storage: any;
  userAddress: string;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const DeliverymanPage = ({
  children,
  storage,
  userAddress,
  contract,
  Tezos,
}: DeliverymanPageProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("AvailableOrder");

  const availableOrderFilter = (order : any) => {
    return order.seller_accepted && !order.deliver_accepted;
  };

  const availableOrderDisplayItems = (order : any) => {
    return [order.delivery_fee / 1000000, order.created_at, order.seller, order.buyer];
  };

  const yourOrderFilter = (order : any) => {
    return order.deliver === userAddress && order.deliver_accepted && !order.payment_settled;
  };

  const yourOrderDisplayItems = (order : any) => {
    return [order.delivery_fee / 1000000, order.created_at, order.seller, order.buyer];
  };

  return (
    <div className="main-box">
      <div className="title">
        <h1>DeMove</h1>
      </div>
      <div id="tabs">
        <div
          id="availableOrder"
          className={activeTab === "AvailableOrder" ? "active" : ""}
          onClick={() => setActiveTab("AvailableOrder")}
        >
          Available orders
        </div>
        <div
          id="order"
          className={activeTab === "YourOrder" ? "active" : ""}
          onClick={() => setActiveTab("YourOrder")}
        >
          Your orders
        </div>
      </div>
      <div id="dialog">
        <div id="content">
          {activeTab === "AvailableOrder" ? (
            <div>
              <OrderBrowser storage={storage} buttonType="available" orderFilter={availableOrderFilter} displayItems={availableOrderDisplayItems} contract={contract} Tezos={Tezos} />
            </div>
          ) : (
            <div>
              <OrderBrowser storage={storage} buttonType="deliveryman" orderFilter={yourOrderFilter} displayItems={yourOrderDisplayItems} contract={contract} Tezos={Tezos} />
            </div>
          )}
        </div>
        <div className="buttons">
          {children}
        </div>
      </div>
      <div id="footer">
        <img src="built-with-taquito.png" alt="Built with Taquito" />
      </div>
    </div>
  );

};

export default DeliverymanPage;
