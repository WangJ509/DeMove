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
    return [<><b>Delivery fee:</b> {order.delivery_fee / 1000000} ꜩ</>, <><b>Time:</b> {order.created_at}</>, <><b>Seller:</b> {order.seller}</>, <><b>Buyer:</b> {order.buyer}</>];
  };

  const yourOrderFilter = (order : any) => {
    return order.deliver === userAddress && order.deliver_accepted && !order.payment_settled;
  };

  const yourOrderDisplayItems = (order : any) => {
    return [<><b>Delivery fee:</b> {order.delivery_fee / 1000000} ꜩ</>, <><b>Time:</b> {order.created_at}</>, <><b>Seller:</b> {order.seller}</>, <><b>Buyer:</b> {order.buyer}</>];
  };

  const historyOrderFilter = (order : any) => {
    return order.deliver === userAddress && order.payment_settled;
  };

  const historyDisplayItems = (order : any) => {
    return [<><b>Delivery fee:</b> {order.delivery_fee / 1000000} ꜩ</>, <><b>Time:</b> {order.created_at}</>];
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
        <div
          id="order"
          className={activeTab === "History" ? "active" : ""}
          onClick={() => setActiveTab("History")}
        >
          Order history
        </div>
      </div>
      <div id="dialog">
        <header>Welcome, deliveryman!</header>
        <div id="content">
          {activeTab === "AvailableOrder" && (
            <div>
              <OrderBrowser storage={storage} buttonType="available" orderFilter={availableOrderFilter} displayItems={availableOrderDisplayItems} contract={contract} Tezos={Tezos} />
            </div>
          )}
          {activeTab === "YourOrder" && (
            <div>
              <OrderBrowser storage={storage} buttonType="deliveryman" orderFilter={yourOrderFilter} displayItems={yourOrderDisplayItems} contract={contract} Tezos={Tezos} />
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

export default DeliverymanPage;
