//BUDGET Controller
var budgetController = (function () {
    var x = 23;
    function add(a) {
        return a + x;
    }


    return {
        publicTest: function (b) {
            return add(b);
        }
    }
})();


var UIController = (function () {


    //Some code;

})();



var controller = (function (budgetCtrl, UICtrl) {

    var z = budgetCtrl.publicTest(10);

    return {
        anotherPublic: function () {
            console.log(z);
        }
    }

})(budgetController, UIController);