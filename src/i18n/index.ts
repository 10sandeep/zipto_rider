import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome to SkiDO",
            "login_title": "Login with Mobile",
            "enter_mobile": "Enter Mobile Number",
            "send_otp": "Send OTP",
            "language_select": "Select Language",
            "continue": "Continue",
            "online": "Online",
            "offline": "Offline",
            "accept": "Accept",
            "reject": "Reject"
        }
    },
    or: {
        translation: {
            "welcome": "SkiDO କୁ ସ୍ୱାଗତ",
            "login_title": "ମୋବାଇଲ୍ ସହିତ ଲଗ୍ ଇନ୍ କରନ୍ତୁ",
            "enter_mobile": "ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ",
            "send_otp": "OTP ପଠାନ୍ତୁ",
            "language_select": "ଭାଷା ଚୟନ କରନ୍ତୁ",
            "continue": "ଆଗକୁ ବଢନ୍ତୁ",
            "online": "ଅନଲାଇନ୍",
            "offline": "ଅଫଲାଇନ୍",
            "accept": "ଗ୍ରହଣ କରନ୍ତୁ",
            "reject": "ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
