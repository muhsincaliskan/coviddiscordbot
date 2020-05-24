import Localize from "localize"
var countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/tr.json"));
const localize=new Localize("./translations/")
function localizeCountry(country) {
    const aliasofABD_tr=["amerika birleşik devletleri","amerika","amerika birleşik","amerika birleşik devleti"]
    const allAliases=["all","global"]
    if (aliasofABD_tr.includes(country)) 
        return "USA"
    if(countries.isValid(country)||allAliases.includes(country))
        return country
    else{
        if(country.charAt(0)=="i")
            country=country.replace("i","İ")
        var country_tr=countries.getAlpha2Code(country,"tr")
        return country_tr?country_tr.toLowerCase():country
    }
}
export {localize,localizeCountry}