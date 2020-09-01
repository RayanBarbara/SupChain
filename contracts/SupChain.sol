// SPDX-License-Identifier: MIT
pragma solidity  >=0.5.16;

contract SupChain{
    
    //List of events
    event orderCreated(uint256 _orderID, address _counterparty);
    event orderShipped(uint256 _orderID, address _counterparty);
    event orderStored(uint256 _orderID, address _counterparty);
    event orderOutOfCompliance(uint256 _orderID, address _counterparty);
    event orderCompleted(uint256 _orderID, address _counterparty);
    
    // Possible state of the order
    enum StateType {Created, InTransit, Stored, OutOfComplicance, Completed}

    //The status of an order on the supply chain
    struct Status{
        // State of the order
        StateType state;
        // User taking over the order
        address currentCounterparty;
        // Previous user possessing the order
        address previousCounterparty;
        // IOT device monitoring the product temperature and location
        string iotDevice;
        // Actual location of the order
        string actualLocation;
        // Actual temperature of the environment
        int256 actualTemperature;
        // Next destination of the order
        string destination;
        // Date of creation/Shipping/Storage of the order
        uint256 date;
    }
    
    // An order of the supply chain
    struct Order{
        // ID of the order
        uint256 orderID;
        //Number of time the order has been shipped/stored 
        uint256 numberOfUpdate;
        // Barcode of the corder
        string barcode;
        // User starting the supply chain by introducing an order
        address initiatingCounterparty;
        // List  the products inside the order
        string productsList;
        // Temperature minimal of the recommended environment
        int256 temperatureMinimal;
        // Temperature maximal of the recommended environment
        int256 temperatureMaximal;
        // Expiration date of the products
        uint256 expirationDate;
        // Last destination of the order
        string finalDestination;
        //Record the whole evolution of the status of an order
        mapping (uint256 => Status) statutes;
    }
    
    // Number of created order
    uint256 public orderCount = 0;

    //Just a test
    string test;
    
    //Map the entirety of the orders of the supply chain
    Order[] public orders;
    
    //Function allowing to know if an order is out of compliance or completed
    function verification(uint256 id, string memory currentLocation, int256 currentTemp, int256 typeOfOrderUpdate) internal returns(StateType){
        StateType orderState;
        //We verify that the shipper/storer complied with the recommended order's storage/shipping environment 
        if(currentTemp < orders[id].temperatureMinimal || currentTemp > orders[id].temperatureMaximal){
            orderState = StateType.OutOfComplicance;
            emit orderOutOfCompliance(id, msg.sender);
        //We verify if the order has arrived to its final destination
        }else if(keccak256(abi.encodePacked(currentLocation))==keccak256(abi.encodePacked(orders[id].finalDestination))){
            orderState = StateType.Completed;
            emit orderCompleted(id, msg.sender);
        }else if(typeOfOrderUpdate == 1){
            orderState = StateType.Stored;
            emit orderStored(id, msg.sender);
        }else if(typeOfOrderUpdate == 2){
            orderState = StateType.InTransit;
            emit orderShipped(id, msg.sender);
        }
        return orderState;
    }
    
    //Function allowing to create an order and add to the map with a null initial status
    function createOrder(string memory _barCode, string memory _productList, int256 _min, int256 _max, uint256 _expDate, string memory _fDestination) public{
        //We create a new order, give it its id, and add the variable inputted by the user
        Order memory newOrder = Order(orderCount, 0, _barCode, msg.sender, _productList, _min, _max, _expDate, _fDestination);
        orders.push(newOrder);
        //We had the initial status of the order
        orders[orderCount].statutes[orders[orderCount].numberOfUpdate] = Status(StateType.Created, msg.sender, msg.sender, '', '', 0, '', now);
        emit orderCreated(orderCount, msg.sender);
        //We update the total number of order
        orderCount++;
    }
    
    //Function allowing to change the status of an order when being stored
    function storeOrder(uint256 id, string memory actualLoc, int256 actualTemp, string memory iotDevice) public{
        //Get the correct state of the order
        StateType actualState = verification(id, actualLoc, actualTemp, 1);
        //We select the propert place where the status will be recorded
        orders[id].statutes[orders[id].numberOfUpdate + 1] = Status(actualState, msg.sender,orders[id].statutes[orders[id].numberOfUpdate].previousCounterparty, iotDevice, actualLoc, actualTemp, '', now);
        //We update the order number of update
        orders[id].numberOfUpdate++;
    }
    
    //Function allowing to change the status of an order when being shipped
    function shipOrder(uint256 id, string memory actualLoc, int256 actualTemp, string memory iotDevice, string memory nextDestination) public {
        StateType actualState = verification(id, actualLoc, actualTemp, 1);
        orders[id].statutes[orders[id].numberOfUpdate + 1] = Status(actualState, msg.sender, orders[id].statutes[orders[id].numberOfUpdate].previousCounterparty, iotDevice, actualLoc, actualTemp, nextDestination, now);
        orders[id].numberOfUpdate++;
    }
    
    //Function allowing to get the desired status of an order
    function getStatus(uint256 id, uint256 concernedStatusNumber) public view returns(StateType state, address cParty, address lParty, string memory device, string memory cLocation, int256 cTemp, string memory destination){
        //Locate the concerned status of an order
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        //Return all the status's variable
        return(concernedStatus.state, concernedStatus.currentCounterparty, concernedStatus.previousCounterparty, concernedStatus.iotDevice, concernedStatus.actualLocation, concernedStatus.actualTemperature, concernedStatus.destination);
    }
    
    //Function allowing to get the desired order basic information
    function getOrder(uint256 id) public view returns(uint256 _id, uint256 updateNumber, string memory barCode, address iParty, string memory products, int256 min, int256 max, uint256 expDate, string memory fDestination){
        Order memory o = orders[id];
        return(o.orderID, o.numberOfUpdate, o.barcode, o.initiatingCounterparty, o.productsList, o.temperatureMinimal, o.temperatureMaximal, o.expirationDate, o.finalDestination);
    }

    //Getter function returning the number of orders created
    function getOrderLength() public view returns(uint256 length){
        uint256 _length = orders.length;
        return _length;
    }
    
    //Getter function of the number of times an order was updated
    function getOrderNumberOfUpdate(uint256 id) public view returns(uint256 numberUpdate){
        Order memory o = orders[id];
        uint256 number = o.numberOfUpdate;
        return number;
    }
    
    //Getter function of the barcode of an order
    function getBarcode(uint256 id) public view returns(string memory barCode){
        Order memory o = orders[id];
        string memory barcode = o.barcode;
        return barcode;
    }    
    
    //Getter function of the initiating counterparty of an order
    function getInitiatingCounterpary(uint256 id) public view returns(address iParty){
        Order memory o = orders[id];
        address party = o.initiatingCounterparty;
        return party;
    }
    
    //Getter function of the product list of an order
    function getProductList(uint256 id) public view returns(string memory products){
        Order memory o = orders[id];
        string memory product = o.productsList;
        return product;
    }
    
    //Getter function of an order's environment minimal temperature
    function getMinTemp(uint256 id) public view returns(int256 minTemp){
        Order memory o = orders[id];
        int256 temp = o.temperatureMinimal;
        return temp;
    }
    
    //Getter function of an order's environment maximal temperature
    function getMaxTemp(uint256 id) public view returns(int256 maxTemp){
        Order memory o = orders[id];
        int256 temp = o.temperatureMaximal;
        return temp;
    }
    
    //Getter function of the expiration date of an order
    function getExpiration(uint256 id) public view returns(uint256 expiration){
        Order memory o = orders[id];
        uint256 exp = o.expirationDate;
        return exp;
    }
    
    //Getter function of the last destination of an order
    function getLastDestination(uint256 id) public view returns(string memory lastDestination){
        Order memory o = orders[id];
        string memory dest = o.finalDestination;
        return dest;
    }
    
    //Getter function of the current state of an order
    function getState(uint256 id, uint256 concernedStatusNumber) public view returns(StateType state){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.state;
    }
    
    //Getter function of the current counterparty  of an order
    function getCurrentCounterpary(uint256 id, uint256 concernedStatusNumber) public view returns(address cParty){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.currentCounterparty;
    }
    
    //Getter function of the previous counterparty of an order    
    function getPreviousCounterpary(uint256 id, uint256 concernedStatusNumber) public view returns(address pParty){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.previousCounterparty;
    }
    
    //Getter function of the monitoring device of an order
    function getDevice(uint256 id, uint256 concernedStatusNumber) public view returns(string memory device){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.iotDevice;
    }
    
    //Getter function of the current location of an order
    function getCurrentLocation(uint256 id, uint256 concernedStatusNumber) public view returns(string memory cLocation){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.actualLocation;
    }
    
    //Getter function of the actual temperature of an order
    function getCurrentTemperature(uint256 id, uint256 concernedStatusNumber) public view returns(int256 cTemp){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.actualTemperature;
    }
    
    //Getter function of the next destination of an order
    function getNextDestination(uint256 id, uint256 concernedStatusNumber) public view returns(string memory nDestination){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.destination;
    }
    
    //Getter function of the date of creation/shipping/storage of an order
    function getDate(uint256 id, uint256 concernedStatusNumber) public view returns(uint256 date){
        Status memory concernedStatus = orders[id].statutes[concernedStatusNumber];
        return concernedStatus.date;
    }

}