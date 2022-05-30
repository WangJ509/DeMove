import React, { useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import RestaurantBrowser from "./RestaurantBrowser";
import OrderBrowser from "./OrderBrowser";
import ContractButton from "./ContractButton";

type SellerPageProps = {
  children: React.ReactNode;
  storage: any;
  userAddress: string;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const SellerPage = ({
  children,
  storage,
  userAddress,
  contract,
  Tezos,
}: SellerPageProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("Restaurant");

  const getRegisterSellerArg = async () => {
    const name = prompt('Your name');
    return [name];
  };

  const getAddProductArg = async () => {
    const name = prompt('Product name');
    const desc = prompt('Product description');
    const price = prompt('Product price');
    return [desc, name, price];
  };

  const orderFilter = (order : any) => {
    return order.seller === userAddress && !order.payment_settled;
  };

  const displayItems = (order : any) => {
    return [order.product_price / 1000000, order.created_at, String(order.seller_accepted), String(order.deliver_accepted)];
  };

  if (!storage || !storage.seller_info.some((x : any) => x.data.key.value === userAddress)) {
    return (
      <div className="main-box">
        <div className="title">
          <h1>DeMove</h1>
        </div>
        <div id="dialog">
          <header>Register</header>
          <div id="content">
            <p>Your haven't register. Click the button below to register.</p>
            <ContractButton contract={contract} Tezos={Tezos} contractMethod="register_seller" getArgs={getRegisterSellerArg}>
              <i className="fas fa-address-card"></i>&nbsp; Register
            </ContractButton>
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
  }

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
          Your dishes
        </div>
        <div
          id="order"
          className={activeTab === "Order" ? "active" : ""}
          onClick={() => setActiveTab("Order")}
        >
          Your orders
        </div>
      </div>
      <div id="dialog">
        <div id="content">
          {activeTab === "Restaurant" ? (
            <div>
              <RestaurantBrowser storage={storage} seller={userAddress} contract={contract} Tezos={Tezos} />
              <ContractButton contract={contract} Tezos={Tezos} contractMethod="add_product" getArgs={getAddProductArg}>
                <i className="fas fa-plus"></i>&nbsp; Add product
              </ContractButton>
            </div>
          ) : (
            <div>
              <OrderBrowser storage={storage} buttonType="seller" orderFilter={orderFilter} displayItems={displayItems} contract={contract} Tezos={Tezos} />
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

export default SellerPage;
