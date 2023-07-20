//jshint esversion:6

// console.log(module);

module.exports = getDate;

function getDate() {
    var today = new Date();
    var day = "";
    var options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };
    var day = today.toLocaleDateString("en-US",options);
    return day;
}

// module.exports = getData;