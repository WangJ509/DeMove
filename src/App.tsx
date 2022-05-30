import React, { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import UpdateContract from "./components/UpdateContract";
import Transfers from "./components/Transfers";
import MainPage from "./components/MainPage";
import RestaurantPage from "./components/RestaurantPage";
import ContractButton from "./components/ContractButton";
import ChooseRolePage from "./components/ChooseRolePage";
import BuyerPage from "./components/BuyerPage";
import DeliverymanPage from "./components/DeliverymanPage";
import SellerPage from "./components/SellerPage";

enum BeaconConnection {
  NONE = "",
  LISTENING = "Listening to P2P channel",
  CONNECTED = "Channel connected",
  PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
  PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
}

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://ithacanet.smartpy.io/")
  );
  const [contract, setContract] = useState<any>(undefined);
  const [publicToken, setPublicToken] = useState<string | null>("");
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [storage, setStorage] = useState<any>(null);
  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("MainPage");

  useEffect(() => {
    const intervalId = setInterval(() => {
      /*
      if (contract) {
        const newStorage: any = await contract.storage();
        if (newStorage) setStorage(newStorage);
      }
      */
      Promise.all(['https://api.better-call.dev/v1/bigmap/ithacanet/103781/keys',
        'https://api.better-call.dev/v1/bigmap/ithacanet/103782/keys',
        'https://api.better-call.dev/v1/bigmap/ithacanet/103783/keys',
        ].map(url => fetch(url)))
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(jsons => setStorage({orders: jsons[0], seller_info: jsons[1], seller_products: jsons[2]}));
    }, 3 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, /*[contract]*/ []);

  const contractAddress: string = "KT1JTTGN6DR7LJ7LJrck9zYg6DvpGqDJS93n";

  const generateQrCode = (): { __html: string } => {
    const qr = qrcode(0, "L");
    qr.addData(publicToken || "");
    qr.make();

    return { __html: qr.createImgTag(4) };
  };

  if (publicToken && (!userAddress || isNaN(userBalance))) { // Connecting to wallet
    return (
      <div className="main-box">
        <h1>DeMove</h1>
        <div id="dialog">
          <header>Welcome to DeMove!</header>
          <div id="content">
            <p className="text-align-center">
              <i className="fas fa-broadcast-tower"></i>&nbsp; Connecting to
              your wallet
            </p>
            <div
              dangerouslySetInnerHTML={generateQrCode()}
              className="text-align-center"
            ></div>
            <p id="public-token">
              {copiedPublicToken ? (
                <span id="public-token-copy__copied">
                  <i className="far fa-thumbs-up"></i>
                </span>
              ) : (
                <span
                  id="public-token-copy"
                  onClick={() => {
                    if (publicToken) {
                      navigator.clipboard.writeText(publicToken);
                      setCopiedPublicToken(true);
                      setTimeout(() => setCopiedPublicToken(false), 2000);
                    }
                  }}
                >
                  <i className="far fa-copy"></i>
                </span>
              )}

              <span>
                Public token: <span>{publicToken}</span>
              </span>
            </p>
            <p className="text-align-center">
              Status: {beaconConnection ? "Connected" : "Disconnected"}
            </p>
          </div>
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
  } else if (userAddress && !isNaN(userBalance)) { // Wallet is connected
    if (activeTab === "ChooseRole") {
      return (
        <ChooseRolePage>
          <button className="button" onClick={() => setActiveTab("Buyer")}>
            <span>
              <i className="fas fa-user"></i>&nbsp; Buyer
            </span>
          </button>
          <button className="button" onClick={() => setActiveTab("Deliveryman")}>
            <span>
              <i className="fas fa-motorcycle"></i>&nbsp; Deliveryman
            </span>
          </button>
          <button className="button" onClick={() => setActiveTab("Seller")}>
            <span>
              <i className="fas fa-store"></i>&nbsp; Seller
            </span>
          </button>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </ChooseRolePage>
      );
    }
    else if (activeTab === "Buyer") {
      return (
        <BuyerPage storage={storage} contract={contract} Tezos={Tezos} userAddress={userAddress}>
          <button className="button" onClick={() => setActiveTab("ChooseRole")}>
            <span>
              <i className="fas fa-step-backward"></i>&nbsp; Rechoose role
            </span>
          </button>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </BuyerPage>
      );
    }
    else if (activeTab === "Deliveryman") {
      return (
        <DeliverymanPage storage={storage} contract={contract} Tezos={Tezos} userAddress={userAddress}>
          <button className="button" onClick={() => setActiveTab("ChooseRole")}>
            <span>
              <i className="fas fa-step-backward"></i>&nbsp; Rechoose role
            </span>
          </button>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </DeliverymanPage>
      );
    }
    else if (activeTab === "Seller") {
      return (
        <SellerPage storage={storage} userAddress={userAddress} contract={contract} Tezos={Tezos}>
          <button className="button" onClick={() => setActiveTab("ChooseRole")}>
            <span>
              <i className="fas fa-step-backward"></i>&nbsp; Rechoose role
            </span>
          </button>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </SellerPage>
      );
    }
    else {
      setActiveTab("ChooseRole");
      return <div></div>;
    }
    /*
    return (
      <div className="main-box">
        <h1>DeMove</h1>
        <div id="tabs">
          <div
            id="transfer"
            className={activeTab === "transfer" ? "active" : ""}
            onClick={() => setActiveTab("transfer")}
          >
            Make a transfer
          </div>
          <div
            id="contract"
            className={activeTab === "contract" ? "active" : ""}
            onClick={() => setActiveTab("contract")}
          >
            Interact with a contract
          </div>
        </div>
        <div id="dialog">
          <div id="content">
            {activeTab === "transfer" ? (
              <div id="transfers">
                <h3 className="text-align-center">Make a transfer</h3>
                <Transfers
                  Tezos={Tezos}
                  setUserBalance={setUserBalance}
                  userAddress={userAddress}
                />
              </div>
            ) : (
              <div id="increment-decrement">
                <h3 className="text-align-center">
                  Current counter: <span>storage</span>
                </h3>
                <UpdateContract
                  contract={contract}
                  setUserBalance={setUserBalance}
                  Tezos={Tezos}
                  userAddress={userAddress}
                  setStorage={setStorage}
                />
                <ContractButton
                  contract={contract}
                  Tezos={Tezos}
                  contractMethod="register_seller"
                  contractMethodParams={["I am the best coffee seller"]}>
                  Become coffee
                </ContractButton>
              </div>
            )}
            <p>
              <i className="far fa-file-code"></i>&nbsp;
              <a
                href={`https://better-call.dev/hangzhounet/${contractAddress}/operations`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contractAddress}
              </a>
            </p>
            <p>
              <i className="far fa-address-card"></i>&nbsp; {userAddress}
            </p>
            <p>
              <i className="fas fa-piggy-bank"></i>&nbsp;
              {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
            </p>
          </div>
          <DisconnectButton
            wallet={wallet}
            setPublicToken={setPublicToken}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setWallet={setWallet}
            setTezos={setTezos}
            setBeaconConnection={setBeaconConnection}
          />
        </div>
        <div id="footer">
          <img src="built-with-taquito.png" alt="Built with Taquito" />
        </div>
      </div>
    );
    */
  } else if (!publicToken && !userAddress && !userBalance) { // Wallet is not connected
    if (activeTab === 'Main') {
      return (
        <MainPage>
          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setStorage={setStorage}
            contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
          />
          <button className="button" onClick={() => setActiveTab("Restaurant")}>
            <span>
              <i className="fas fa-utensils"></i>&nbsp; Browse restaurants
            </span>
          </button>
        </MainPage>
      );
    }
    else if (activeTab === 'Restaurant') {
      return (
        <RestaurantPage storage={storage} contract={contract} Tezos={Tezos}>
          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setStorage={setStorage}
            contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
          />
          <button className="button" onClick={() => setActiveTab("Main")}>
            <span>
              <i className="fas fa-step-backward"></i>&nbsp; Go back
            </span>
          </button>
        </RestaurantPage>
      );
    }
    else {
      setActiveTab("Main");
      return <div></div>;
    }
  } else {
    return <div>An error has occurred</div>;
  }
};

export default App;
