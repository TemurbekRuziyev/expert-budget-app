//Budget controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        //Create  item
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID for elements
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //Create new Item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push new item to AllItem
            data.allItems[type].push(newItem);

            //Return new Item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            //ids = [1, 3, 4, 6, 8]

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            //Calculate total income and expenses

            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget -> income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that spends
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc;
            allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data)
        }
    }

})();


//UI controller
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        //1. + or - sign before number;
        //2. exactly 2 decimal point
        //3. comma separating the thousands


        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {

                element = DOMstrings.incomeContainer;

                html = '  <div class="item clearfix" id="inc-%0%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn">' +
                    '&bigotimes;' +
                    //'                                           <i class="ion-ios-close-outline"></i>' +
                    '                                     </button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>';
            } else if (type === 'exp') {

                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%0%">\n' +
                    '                            <div class="item__description">%description%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__percentage">21%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn">' +
                    '&bigotimes;' +
                    //'                                          <i class="ion-ios-close-outline"></i>' +
                    '                                    </button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>';
            }

            //Replace placeholder text from the Data
            newHTML = html.replace('%0%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));


            //Insert HTML text in The DOM
            document.querySelector(element).insertAdjacentHTML('afterbegin', newHTML);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';

                }
            })
        },
        displayMonth: function () {
            var now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ['February', 'January', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function () {

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();


//Global App Controller

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);


    };


    var updateBudget = function () {

        //1. Calculate budget
        budgetCtrl.calculateBudget();

        //2. Return budget
        var budget = budgetCtrl.getBudget();


        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };


    var updatePercentage = function () {

        //1. Calculate percentage
        budgetCtrl.calculatePercentage();
        //2. Read percentage form the budgetController
        var percentages = budgetCtrl.getPercentages();
        //3. Update the UI with new percentage
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        //1. Get input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the Fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and Update percentage
            updatePercentage();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');

            type = splitID[0];
            ID = parseInt(splitID[1]);


            //1.Delete item form the data
            budgetCtrl.deleteItem(type, ID);
            //2. Delete item form UI
            UICtrl.deleteListItem(itemID);

            //3. UpdateBudget()
            updateBudget();

            //4. Calculate and Update percentage
            updatePercentage();

        }


    };

    return {
        init: function () {
            console.log('Application started.');

            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });

            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();

