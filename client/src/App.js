import React, { Component } from "react";
import SupChain from "./contracts/SupChain.json"
import getWeb3 from "./getWeb3";
import "./App.css";

class App extends Component {

  state = {
    web3: null,
    contract: undefined,
    account: null,
    test: '',
    orderCount: 0,
    orderkey: 0,

    state: '',
    currentCounterparty: '0x0',
    previousCounterparty: '0x0',
    iotDevice: '',
    currentLocation: '',
    currentTemp: null,
    destination: '',

    orderID: null,
    numberOfUpdate: null,
    barCode: null,
    initiatingCounterparty: '0x0',
    productList: '',
    minTemp: null,
    maxTemp: null,
    expiration: '',
    lastDestination: '',
    date: '',
    orders: []
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instances.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupChain.networks[networkId];
      const instance = new web3.eth.Contract(SupChain.abi, deployedNetwork && deployedNetwork.address);
      // Set web3, accounts, and contract to the state
      this.setState({ contract: instance, web3: web3, account: accounts[0] }, this.update);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  update = async (event) => {
    const id = await this.state.contract.methods.getOrderLength().call() - 1;
    for (var i = 0; i <= id; i++) {
      var number = await this.state.contract.methods.getOrderNumberOfUpdate(i).call();
      for (var j = 0; j <= number; j++) {
        let orders = [...this.state.orders]
        var barcode = await this.state.contract.methods.getBarcode(i).call();
        var iCounterparty = await this.state.contract.methods.getInitiatingCounterpary(i).call();
        var products = await this.state.contract.methods.getProductList(i).call();
        var minT = await this.state.contract.methods.getMinTemp(i).call();
        var maxT = await this.state.contract.methods.getMaxTemp(i).call();
        var lDest = await this.state.contract.methods.getLastDestination(i).call();
        var intExpDate = await this.state.contract.methods.getExpiration(i).call();
        var GMTExpDate = new Date(intExpDate * 1000);
        var expMonth = '' + (GMTExpDate.getMonth() + 1);
        var expDay = '' + GMTExpDate.getDate();
        var expYear = '' + GMTExpDate.getFullYear();
        if (expMonth.length < 2) {
          expMonth = '0' + expMonth;
        }
        if (expDay.length < 2) {
          expDay = '0' + expDay;
        }
        var stringExpDate = [expYear, expMonth, expDay].join('-');
        var numberState = await this.state.contract.methods.getState(i, j).call();
        var stringState;
        if (numberState === '0') {
          stringState = 'Created';
        }
        if (numberState === '3') {
          stringState = 'Out of compliance';
        } else if (numberState === '4') {
          stringState = 'Completed';
        } else if (numberState === '1') {
          stringState = 'Stored';
        } else if (numberState === '2') {
          stringState = 'In transit';
        }
        var cParty = await this.state.contract.methods.getCurrentCounterpary(i, j).call();
        var lParty = await this.state.contract.methods.getPreviousCounterpary(i, j).call();
        var device = await this.state.contract.methods.getDevice(i, j).call();
        var cLoc = await this.state.contract.methods.getCurrentLocation(i, j).call();
        var cTemp = await this.state.contract.methods.getCurrentTemperature(i, j).call();
        var nDest = await this.state.contract.methods.getNextDestination(i, j).call();
        var intDate = await this.state.contract.methods.getDate(i, j).call();
        var GMTDate = new Date(intDate * 1000);
        var month = '' + (GMTDate.getMonth() + 1);
        var day = '' + GMTDate.getDate();
        var year = '' + GMTDate.getFullYear();
        if (month.length < 2) {
          month = '0' + month;
        }
        if (day.length < 2) {
          day = '0' + day;
        }
        var stringDate = [year, month, day].join('-');

        if (nDest.length === 0) {
          nDest = "Unknow";
        }
        if (device.length === 0) {
          device = "Unknow";
        }
        if (cLoc.length === 0) {
          cLoc = "Manufacturer";
        }

        orders.push({
          orderID: i, numberOfUpdate: j, barCode: barcode, initiatingCounterparty: iCounterparty,
          productList: products, minTemp: minT, maxTemp: maxT, expiration: stringExpDate, lastDestination: lDest,
          state: stringState, currentCounterparty: cParty, previousCounterparty: lParty,
          iotDevice: device, currentTemp: cTemp, currentLocation: cLoc, destination: nDest,
          date: stringDate
        });

        this.setState({
          orders, orderID: null, numberOfUpdate: null, barCode: null, initiatingCounterparty: '0x0',
          productList: '', minTemp: null, maxTemp: null, expiration: '', lastDestination: '',
          state: '', currentCounterparty: '0x0', previousCounterparty: '0x0',
          iotDevice: '', currentTemp: null, currentLocation: '', destination: '',
          date: ''
        });
      }
    }
  }

  create = async (event) => {
    event.preventDefault();
    this.state.orderkey++;
    var stringExpDate = this.state.expiration;
    stringExpDate = stringExpDate.split("-");
    var intExpDate = new Date(stringExpDate[0], stringExpDate[1] - 1, stringExpDate[2]).getTime();
    intExpDate = intExpDate / 1000;
    await this.state.contract.methods.createOrder(this.state.barCode, this.state.productList, this.state.minTemp, this.state.maxTemp, intExpDate, this.state.lastDestination).send({ from: this.state.account });
    this.state.orderCount++;
    let orders = [...this.state.orders]
    const id = await this.state.contract.methods.getOrderLength().call() - 1;
    const number = 0;
    const barcode = await this.state.contract.methods.getBarcode(id).call();
    const iCounterparty = await this.state.contract.methods.getInitiatingCounterpary(id).call();
    const products = await this.state.contract.methods.getProductList(id).call();
    const minT = await this.state.contract.methods.getMinTemp(id).call();
    const maxT = await this.state.contract.methods.getMaxTemp(id).call();
    const lDest = await this.state.contract.methods.getLastDestination(id).call();
    const intDate = await this.state.contract.methods.getDate(id, number).call();
    const GMTDate = new Date(intDate * 1000);
    var month = '' + (GMTDate.getMonth() + 1);
    var day = '' + GMTDate.getDate();
    var year = '' + GMTDate.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    var stringDate = [year, month, day].join('-');

    orders.push({
      orderID: id, numberOfUpdate: number, barCode: barcode, initiatingCounterparty: iCounterparty,
      productList: products, minTemp: minT, maxTemp: maxT, expiration: this.state.expiration, lastDestination: lDest,
      state: 'Created', currentCounterparty: iCounterparty, previousCounterparty: 'Nobody',
      iotDevice: 'None', currentTemp: 0, currentLocation: 'Unknow', destination: 'Unknow',
      date: stringDate
    });

    this.setState({
      orders, orderID: null, numberOfUpdate: null, barCode: null, initiatingCounterparty: '0x0',
      productList: '', minTemp: null, maxTemp: null, expiration: '', lastDestination: '',
      state: '', currentCounterparty: '0x0', previousCounterparty: '0x0',
      iotDevice: '', currentTemp: null, currentLocation: '', destination: '',
      date: ''
    });
  }

  ship = async (event) => {
    event.preventDefault();
    const id = this.state.orderID;
    var number = await this.state.contract.methods.getOrderNumberOfUpdate(id).call();
    const verifyState = await this.state.contract.methods.getState(id, number).call();
    if (verifyState === '4') {
      alert('The order with the id ' + id + ' has already been completed');
    } else if (verifyState === '3') {
      alert('The order with the id ' + id + ' is out of compliance');
    } else {
      await this.state.contract.methods.shipOrder(this.state.orderID, this.state.currentLocation, this.state.currentTemp, this.state.iotDevice, this.state.destination).send({ from: this.state.account });
      let orders = [...this.state.orders]
      const number = await this.state.contract.methods.getOrderNumberOfUpdate(id).call();
      const barcode = await this.state.contract.methods.getBarcode(id).call();
      const iCounterparty = await this.state.contract.methods.getInitiatingCounterpary(id).call();
      const products = await this.state.contract.methods.getProductList(id).call();
      const minT = await this.state.contract.methods.getMinTemp(id).call();
      const maxT = await this.state.contract.methods.getMaxTemp(id).call();
      const lDest = await this.state.contract.methods.getLastDestination(id).call();
      const intExpDate = await this.state.contract.methods.getExpiration(id).call();
      var GMTExpDate = new Date(intExpDate * 1000);
      var expMonth = '' + (GMTExpDate.getMonth() + 1);
      var expDay = '' + GMTExpDate.getDate();
      var expYear = '' + GMTExpDate.getFullYear();
      if (expMonth.length < 2) {
        expMonth = '0' + expMonth;
      }
      if (expDay.length < 2) {
        expDay = '0' + expDay;
      }
      var stringExpDate = [expYear, expMonth, expDay].join('-');
      var numberState = await this.state.contract.methods.getState(id, number).call();
      var stringState;
      if (numberState === '3') {
        stringState = 'Out of compliance';
        alert('The order with the id: ' + id + ' is out of compliance. Please take the necessary measures');
      } else if (numberState === '4') {
        stringState = 'Completed';
      } else if (numberState === '1') {
        stringState = 'Stored';
      } else if (numberState === '2') {
        stringState = 'In transit';
      }
      const cParty = await this.state.contract.methods.getCurrentCounterpary(id, number).call();
      const lParty = await this.state.contract.methods.getPreviousCounterpary(id, number).call();
      const device = await this.state.contract.methods.getDevice(id, number).call();
      const cLoc = await this.state.contract.methods.getCurrentLocation(id, number).call();
      const cTemp = await this.state.contract.methods.getCurrentTemperature(id, number).call();
      const nDest = await this.state.contract.methods.getNextDestination(id, number).call();
      const intDate = await this.state.contract.methods.getDate(id, number).call();
      var GMTDate = new Date(intDate * 1000);
      var month = '' + (GMTDate.getMonth() + 1);
      var day = '' + GMTDate.getDate();
      var year = '' + GMTDate.getFullYear();
      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }
      var stringDate = [year, month, day].join('-');

      orders.push({
        orderID: id, numberOfUpdate: number, barCode: barcode, initiatingCounterparty: iCounterparty,
        productList: products, minTemp: minT, maxTemp: maxT, expiration: stringExpDate, lastDestination: lDest,
        state: stringState, currentCounterparty: cParty, previousCounterparty: lParty,
        iotDevice: device, currentTemp: cTemp, currentLocation: cLoc, destination: nDest,
        date: stringDate
      });

      this.setState({
        orders, orderID: null, numberOfUpdate: null, barCode: null, initiatingCounterparty: '0x0',
        productList: '', minTemp: null, maxTemp: null, expiration: '', lastDestination: '',
        state: '', currentCounterparty: '0x0', previousCounterparty: '0x0',
        iotDevice: '', currentTemp: null, currentLocation: '', destination: '',
        date: ''
      });
    }
  }

  store = async (event) => {
    event.preventDefault();
    const id = this.state.orderID;
    var number = await this.state.contract.methods.getOrderNumberOfUpdate(id).call();
    const verifyState = await this.state.contract.methods.getState(id, number).call();
    if (verifyState === '4') {
      alert('The order with the id ' + id + ' has already been completed');
    } else if (verifyState === '3') {
      alert('The order with the id ' + id + ' is out of compliance');
    } else {
      this.state.orderkey++;
      await this.state.contract.methods.storeOrder(this.state.orderID, this.state.currentLocation, this.state.currentTemp, this.state.iotDevice).send({ from: this.state.account });
      let orders = [...this.state.orders]

      number = await this.state.contract.methods.getOrderNumberOfUpdate(id).call();
      const barcode = await this.state.contract.methods.getBarcode(id).call();
      const iCounterparty = await this.state.contract.methods.getInitiatingCounterpary(id).call();
      const products = await this.state.contract.methods.getProductList(id).call();
      const minT = await this.state.contract.methods.getMinTemp(id).call();
      const maxT = await this.state.contract.methods.getMaxTemp(id).call();
      const lDest = await this.state.contract.methods.getLastDestination(id).call();
      const intExpDate = await this.state.contract.methods.getExpiration(id).call();
      const GMTExpDate = new Date(intExpDate * 1000);
      var expMonth = '' + (GMTExpDate.getMonth() + 1);
      var expDay = '' + GMTExpDate.getDate();
      var expYear = '' + GMTExpDate.getFullYear();
      if (expMonth.length < 2) {
        expMonth = '0' + expMonth;
      }
      if (expDay.length < 2) {
        expDay = '0' + expDay;
      }
      var stringExpDate = [expYear, expMonth, expDay].join('-');
      const numberState = await this.state.contract.methods.getState(id, number).call();
      var stringState;
      if (numberState === '3') {
        stringState = 'Out of compliance';
        alert('The order with the id: ' + id + ' is out of compliance. Please take the necessary measures');
      } else if (numberState === '4') {
        stringState = 'Completed';
      } else if (numberState === '1') {
        stringState = 'Stored';
      } else if (numberState === '2') {
        stringState = 'In transit';
      }
      const cParty = await this.state.contract.methods.getCurrentCounterpary(id, number).call();
      const lParty = await this.state.contract.methods.getPreviousCounterpary(id, number).call();
      const device = await this.state.contract.methods.getDevice(id, number).call();
      const cLoc = await this.state.contract.methods.getCurrentLocation(id, number).call();
      const cTemp = await this.state.contract.methods.getCurrentTemperature(id, number).call();
      const intDate = await this.state.contract.methods.getDate(id, number).call();
      const GMTDate = new Date(intDate * 1000);
      var month = '' + (GMTDate.getMonth() + 1);
      var day = '' + GMTDate.getDate();
      var year = '' + GMTDate.getFullYear();
      if (month.length < 2) {
        month = '0' + month;
      }
      if (day.length < 2) {
        day = '0' + day;
      }
      var stringDate = [year, month, day].join('-');

      orders.push({
        orderID: id, numberOfUpdate: number, barCode: barcode, initiatingCounterparty: iCounterparty,
        productList: products, minTemp: minT, maxTemp: maxT, expiration: stringExpDate, lastDestination: lDest,
        state: stringState, currentCounterparty: cParty, previousCounterparty: lParty,
        iotDevice: device, currentTemp: cTemp, currentLocation: cLoc, destination: 'Unknow',
        date: stringDate
      });

      this.setState({
        orders, orderID: null, numberOfUpdate: null, barCode: null, initiatingCounterparty: '0x0',
        productList: '', minTemp: null, maxTemp: null, expiration: '', lastDestination: '',
        state: '', currentCounterparty: '0x0', previousCounterparty: '0x0',
        iotDevice: '', currentTemp: null, currentLocation: '', destination: '',
        date: ''
      });
    }
  }

  handleInputChange = (event) => {
    let input = event.target;
    let name = event.target.name;
    let value = input.value;
    this.setState({
      [name]: value
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contracts...</div>;
    }
    const orders = this.state.orders;
    return (
      <div className="App">

        <div id="OrderCreateShipStock" className="Order_Create_Ship_Stock">

          <div id="OrderCreate" className="Order_Create">
            <form onSubmit={this.create}>
              <label htmlFor="BarcodeInput">
                <span>Barcode:</span>
                <input name="barCode" id="Barcode" className="Barcorde" type="text" placeholder="Order's Barcode..." required
                  minLength="12" maxLength="13" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ProductListInput">
                <span>Product list:</span>
                <input name="productList" id="ProductList" className="Product_List" type="text"
                  placeholder="Product list of the order...." required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ExpirationDateInput">
                <span>Expiration date:</span>
                <input name="expiration" id="ExpirationDate" className="Expiration_Date" type="date" required onChange={this.handleInputChange} />
              </label>
              <label htmlFor="TemperatureMinimalInput">
                <span>Temperature minimal</span>
                <input name="minTemp" id="TemperatureMinimal" className="Temperature_Minimal" type="number"
                  placeholder="Minimal temperature of order's environment..." required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="TemperatureMaximalInput">
                <span>Temperature maximal</span>
                <input name="maxTemp" id="TemperatureMaximal" className="Temperature_Maximal" type="number"
                  placeholder="Maximal temperature of order's environment..." required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="FinalDestinationInput">
                <span>Final destination</span>
                <input name="lastDestination" id="FinalDestination" className="Final_Destination" type="text"
                  placeholder="Order's final destination..." required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <button id="SubmitCreateOrder" className="Submit_Create_Order" type="submit" value="submit">Create Order</button>
            </form>
          </div >

          <div id="OrderShip" className="Order_Ship">
            <form onSubmit={this.ship}>
              <label htmlFor="OrderIDInput">
                <span>OrderID</span>
                <input name="orderID" id="Ship-OrderID" className="Order_ID" type="number" placeholder="Order's ID" required
                  minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ActualLocationInput">
                <span>Actual location</span>
                <input name="currentLocation" id="Ship-ActualLocation" className="Actual_Location_Input" type="text"
                  placeholder="Order's actual location" required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ActualTemperatureInput">
                <span>Actual temperature</span>
                <input name="currentTemp" id="Ship-ActualTemperature" className="Actual_Temperature" type="number"
                  placeholder="Order's actual environment temperature" required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="IOTDeviceInput">
                <span>IOT Device</span>
                <select name="iotDevice" id="Ship-IOTDevice" className="IOT_Device_Input" required onChange={this.handleInputChange}>
                  <option>---Please select an IOT Device---</option>
                  <option value="D-001">D-001</option>
                  <option value="D-002">D-002</option>
                  <option value="D-003">D-003</option>
                  <option value="D-004">D-004</option>
                  <option value="D-005">D-005</option>
                </select>
              </label>
              <label htmlFor="DestinationInput">
                <span>Destination</span>
                <input name="destination" id="Destination" className="Destination_" type="text"
                  placeholder="Order's destination" minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <button id="SubmitShipOrder" className="Submit_Ship_Order" type="submit">Ship Order</button>
            </form>
          </div>


          <div id="OrderStore" className="Order_Store">
            <form onSubmit={this.store}>
              <label htmlFor="OrderIDInput">
                <span>OrderID</span>
                <input name="orderID" id="Store-OrderID" className="Order_ID" type="number" placeholder="Order's ID" required
                  minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ActualLocationInput">
                <span>Actual location</span>
                <input name="currentLocation" id="Store-ActualLocation" className="Actual_Location_Input" type="text"
                  placeholder="Order's actual location" required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="ActualTemperatureInput">
                <span>Actual temperature</span>
                <input name="currentTemp" id="ActualTemperature" className="Actual_Temperature" type="number"
                  placeholder="Order's actual environment temperature" required minLength="1" maxLength="128" onChange={this.handleInputChange} />
              </label>
              <label htmlFor="IOTDeviceInput">
                <span>IOT Device</span>
                <select name="iotDevice" id="Ship-IOTDevice" className="IOT_Device_Input" required value={this.state.IOTDeviceInput} onChange={this.handleInputChange}>
                  <option>---Please select an IOT Device---</option>
                  <option value="D-006">D-006</option>
                  <option value="D-007">D-007</option>
                  <option value="D-008">D-008</option>
                  <option value="D-009">D-009</option>
                  <option value="D-010">D-010</option>
                </select>
              </label>
              <button id="SubmitStoreOrder" className="Submit_Store_Order" type="submit">Store Order</button>
            </form>
          </div>

        </div>

        <div id="OrderListTable" className="List">
          <h2>Orders</h2>
          <table id="ShipmentList" className="Shipment_List">
            <thead>
              <tr>
                <th id="OC01" className="Column">OrderID</th>
                <th id="OC02" className="Column">State</th>
                <th id="OC03" className="Column">Number of update</th>
                <th id="OC04" className="Column">Barcode</th>
                <th id="OC05" className="Column">Initial counterparty</th>
                <th id="OC06" className="Column">Current counterparty</th>
                <th id="OC07" className="Column">Previous counterparty</th>
                <th id="OC08" className="Column">Product list</th>
                <th id="OC09" className="Column">Monitoring device</th>
                <th id="OC10" className="Column">Actual temperature</th>
                <th id="OC11" className="Column">Minimum temperature</th>
                <th id="OC12" className="Column">Maximum temperature</th>
                <th id="OC13" className="Column">Actual location</th>
                <th id="OC14" className="Column">Next destination</th>
                <th id="OC15" className="Column">Final destination</th>
                <th id="OC16" className="Column">Expiration date</th>
                <th id="OC17" className="Column">Date of creation/modification</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                return (
                  <tr key={order.orderkey}>
                    <td>{order.orderID}</td>
                    <td>{order.state}</td>
                    <td>{order.numberOfUpdate}</td>
                    <td>{order.barCode}</td>
                    <td>{order.initiatingCounterparty}</td>
                    <td>{order.currentCounterparty}</td>
                    <td>{order.previousCounterparty}</td>
                    <td>{order.productList}</td>
                    <td>{order.iotDevice}</td>
                    <td>{order.currentTemp}</td>
                    <td>{order.minTemp}</td>
                    <td>{order.maxTemp}</td>
                    <td>{order.currentLocation}</td>
                    <td>{order.destination}</td>
                    <td>{order.lastDestination}</td>
                    <td>{order.expiration}</td>
                    <td>{order.date}</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    );
  }
}

export default App;
