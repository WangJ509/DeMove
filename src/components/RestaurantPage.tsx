import React from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import RestaurantBrowser from "./RestaurantBrowser";

type RestaurantPageProps = {
  storage: any;
  children: React.ReactNode | any;
  contract: WalletContract | any;
  Tezos: TezosToolkit;
};

const RestaurantPage = ({
  storage,
  children,
  contract,
  Tezos,
}: RestaurantPageProps): JSX.Element => {

  return (
    <div className="main-box">
      <div className="title">
        <h1>DeMove</h1>
      </div>
      <div id="dialog">
        <header>Restaurants</header>
        <div id="content">
          <RestaurantBrowser storage={storage} contract={contract} Tezos={Tezos}/>
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

export default RestaurantPage;
