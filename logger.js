let log = (req, res, next) => {
    console.log("Mi propio Middleware");
    next(); //El next es de awebo
};

module.exports = {
    logeo: log
};