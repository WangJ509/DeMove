import React, { useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import RestaurantBrowser from './RestaurantBrowser';
import OrderBrowser from "./OrderBrowser";

type BuyerPageProps = {
  children: React.ReactNode;
  storage: any;
  userAddress: string;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const BuyerPage = ({
  children,
  storage,
  userAddress,
  contract,
  Tezos,
}: BuyerPageProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("Restaurant");

  const orderFilter = (order : any) => {
    return order.buyer === userAddress && !order.payment_settled;
  };

  const displayItems = (order : any) => {
    return [<><b>Time:</b> {order.created_at}</>, <><b>Seller accepted:</b> {String(order.seller_accepted)}</>, <><b>Delivery accepted:</b> {String(order.deliver_accepted)}</>];
  };

  const historyOrderFilter = (order : any) => {
    return order.buyer === userAddress && order.payment_settled;
  };

  const historyDisplayItems = (order : any) => {
      return [<><b>Time:</b> {order.created_at}</>];
  };

  return (
    <div className="main-box">
      <div className="title">
        <h1>DeMove</h1>
      </div>
      <div id="tabs">
        <div
          id="restaurant"
          className={activeTab === "Restaurant" ? "active" : ""}
          onClick={() => setActiveTab("Restaurant")}
        >
          Browse restaurants
        </div>
        <div
          id="order"
          className={activeTab === "Order" ? "active" : ""}
          onClick={() => setActiveTab("Order")}
        >
          Your orders
        </div>
        <div
          id="history"
          className={activeTab === "History" ? "active" : ""}
          onClick={() => setActiveTab("History")}
        >
          Order history
        </div>
      </div>
      <div id="dialog">
        <header>Welcome, buyer!</header>
        <div id="content">
          {activeTab === "Restaurant" && (
            <div>
              <RestaurantBrowser storage={storage} contract={contract} Tezos={Tezos} buyButton={true} />
            </div>
          )}
          {activeTab === "Order" && (
            <div>
              <OrderBrowser storage={storage} buttonType="buyer" orderFilter={orderFilter} displayItems={displayItems} contract={contract} Tezos={Tezos} />
            </div>
          )}
          {activeTab === "History" && (
            <div>
              <OrderBrowser storage={storage} orderFilter={historyOrderFilter} displayItems={historyDisplayItems} contract={contract} Tezos={Tezos} />
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

export default BuyerPage;
