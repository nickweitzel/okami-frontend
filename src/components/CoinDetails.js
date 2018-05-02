/**
 * CoinDetails.js
 *
 * This component will be used by the coin page view to display more details
 * about the coin. It will handle loading the data from the API as well.
 */
import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { globalvars } from '../globalvars';
import {
  ccApiUrl,
  ccImgsUrl,
  priceRoute,
  coinDetailRoute } from '../constants';

import './Components.css';


/**
 * getCoinName:
 * This method uses the coin symbol to retrieve the string name from the master
 * coin list.
 *
 * @param symbol symbol string of a currency
 * @returns name string of currency with that symbol
 */
const getCoinName = symbol =>
  globalvars.coinList.find(coin => coin.symbol === symbol).name;


export class CoinDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinData: {
        usd: null,
        euro: null,
        logoRoute: '',
        netHashesPerSecond: '',
        numBlocks: null,
        blockReward: null,
        proofType: '',
        algorithm: '',
      }, // end coinData
      dataLoaded: false,
      imageLoaded: false,
      errorMessage: '',
    }; // end state

    this.onLoad = this.onLoad.bind(this);
  } // end constructor


  componentDidMount() {
    this.getCoinData();
  } // end componentDidMount()


  onLoad() {
    this.setState({
      imageLoaded: true,
    }); // end setState()
  } // end onLoad


  getCoinData() {
    const promises = [];

    promises.push(axios.get(
      ccApiUrl + priceRoute,
      { params: { fsym: this.props.coinSymbol, tsyms: 'USD,EUR' } },
    )); // end get()

    promises.push(axios.get(
      ccApiUrl + coinDetailRoute,
      { params: { fsyms: this.props.coinSymbol, tsym: 'USD' } },
    )); // end get()

    Promise.all(promises)
      .then((response) => {
        console.log(`CoinDetails.response: ${JSON.stringify(response)}`);
        // check for response error in successful request
        if (response[0].data.Response === 'Error') {
          throw new Error(`price request: ${response[0].data.Message}`);
        } // end if

        this.setState({
          coinData: {
            usd: response[0].data.USD,
            euro: response[0].data.EUR,
            logoRoute: response[1].data.Data[0].CoinInfo.ImageUrl,
            netHashesPerSecond:
              response[1].data.Data[0].CoinInfo.NetHashesPerSecond,
            numBlocks: response[1].data.Data[0].CoinInfo.BlockNumber,
            blockReward: response[1].data.Data[0].CoinInfo.BlockReward,
            proofType: response[1].data.Data[0].CoinInfo.ProofType,
            algorithm: response[1].data.Data[0].CoinInfo.Algorithm,
          }, // end coinData
          dataLoaded: true,
        }); // end setState()
      }) // end then()
      .catch((error) => {
        let message = '';
        if (error.response) {
          message += 'A server error occured with response: \n';
          message += `Status: ${error.response.status}. \n`;
          message += `Message: ${error.response.data}. \n`;
        } else if (error.request) {
          message += 'A server error occured with no response. \n';
          message += `Request: ${error.request}. \n`;
        } else {
          message += 'An error occured generating the server request. \n';
          message += `Message: ${error.message}`;
        } // end if/else
        this.setState({
          errorMessage: message,
        }); // end setState()
      });
  } // end getCoinData


  renderImage() {
    if (this.state.dataLoaded) {
      const style = this.state.imageLoaded ? {} : { visibility: 'hidden ' };
      return (
        <img
          className="coin-logo"
          style={style}
          src={ccImgsUrl + this.state.coinData.logoRoute}
          onLoad={this.onLoad}
          alt="coin-logo"
        />
      ); // end return()
    } // end if

    return <h3>loading currency...</h3>;
  } // end renderImage()

  renderDataList() {
    if (this.state.errorMessage) {
      return <h3>{this.state.errorMessage}</h3>;
    } // end if

    if (!this.state.dataLoaded) {
      return <h3>loading currency...</h3>;
    } // end if

    return (
      <table className="coin-details-data-list">
        <colgroup>
          <col className="coin-details-data-list-col1" />
          <col className="coin-details-data-list-col2" />
        </colgroup>
        <tbody>
          <tr>
            <td>symbol:</td>
            <td>{this.props.coinSymbol}</td>
          </tr>
          <tr>
            <td>price (dollar):</td>
            <td>${this.state.coinData.usd}</td>
          </tr>
          <tr>
            <td>price (euro):</td>
            <td>&euro{this.state.coinData.euro}</td>
          </tr>
          <tr>
            <td>net hashes per second:</td>
            <td>{this.state.coinData.netHashesPerSecond}</td>
          </tr>
          <tr>
            <td>number of blocks:</td>
            <td>{this.state.coinData.numBlocks}</td>
          </tr>
          <tr>
            <td>block reward:</td>
            <td>{this.state.coinData.blockReward}</td>
          </tr>
          <tr>
            <td>proof type:</td>
            <td>{this.state.coinData.proofType}</td>
          </tr>
          <tr>
            <td>algorithm:</td>
            <td>{this.state.coinData.algorithm}</td>
          </tr>
        </tbody>
      </table>
    ); // end return()
  } // end renderDataList()


  render() {
    return (
      <div className="coin-details">
        <div className="coin-details-header">
          <div className="coin-details-logo">
            {this.renderImage()}
          </div>
          <h1 className="coin-details-header-text">
            <b>{getCoinName(this.props.coinSymbol)}</b>
          </h1>
        </div>
        <div>{this.renderDataList()}</div>
      </div>
    ); // end render()
  } // end render()
} // end class CoinDetails


/**
 * props:
 *
 * Required:
 * coinSymbol - symbol string for currency
 */
CoinDetails.propTypes = {
  coinSymbol: PropTypes.string.isRequired,
}; // end propTypes


export default CoinDetails;
