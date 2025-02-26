// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { injectable } from "inversify";

import deCatalog from "readium-desktop/resources/locales/de.json";
import enCatalog from "readium-desktop/resources/locales/en.json";
import esCatalog from "readium-desktop/resources/locales/es.json";
import fiCatalog from "readium-desktop/resources/locales/fi.json";
import frCatalog from "readium-desktop/resources/locales/fr.json";
import itCatalog from "readium-desktop/resources/locales/it.json";
import jaCatalog from "readium-desktop/resources/locales/ja.json";
import kaCatalog from "readium-desktop/resources/locales/ka.json";
import ltCatalog from "readium-desktop/resources/locales/lt.json";
import nlCatalog from "readium-desktop/resources/locales/nl.json";
import ptBrCatalog from "readium-desktop/resources/locales/pt-br.json";
import ptPtCatalog from "readium-desktop/resources/locales/pt-pt.json";
import ruCatalog from "readium-desktop/resources/locales/ru.json";
import zhCnCatalog from "readium-desktop/resources/locales/zh-cn.json";
import koCatalog from "readium-desktop/resources/locales/ko.json";
import svCatalog from "readium-desktop/resources/locales/sv.json";

import { TFunction } from "readium-desktop/typings/en.translation";

import i18next from "i18next";

const i18nextInstance = i18next.createInstance();

// https://www.i18next.com/overview/configuration-options
i18nextInstance.init({
    // https://www.i18next.com/misc/migration-guide#v-20-x-x-to-v-21-0-0
    compatibilityJSON: "v3",
    interpolation: {
        skipOnVariables: false,
    },
    nsSeparator: ":",
    keySeparator: ".",
    // supportedLngs: LANGUAGE_KEYS,
    // nonExplicitSupportedLngs: true,
    // --
    // https://github.com/i18next/i18next/pull/1584
    // https://github.com/i18next/i18next/blob/master/CHANGELOG.md#2000
    // --
    // https://github.com/i18next/i18next/issues/1589
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ignoreJSONStructure: false,
    debug: false,
    resources: {
        "en": {
            translation: enCatalog,
        },
        "fr": {
            translation: frCatalog,
        },
        "fi": {
            translation: fiCatalog,
        },
        "de": {
            translation: deCatalog,
        },
        "es": {
            translation: esCatalog,
        },
        "nl": {
            translation: nlCatalog,
        },
        "ja": {
            translation: jaCatalog,
        },
        "ka": {
            translation: kaCatalog,
        },
        "lt": {
            translation: ltCatalog,
        },
        "pt-BR": {
            translation: ptBrCatalog,
        },
        "pt-PT": {
            translation: ptPtCatalog,
        },
        "zh-CN": {
            translation: zhCnCatalog,
        },
        "it" : {
            translation: itCatalog,
        },
        "ru" : {
            translation: ruCatalog,
        },
        "ko": {
            translation: koCatalog,
        },
        "sv": {
            translation: svCatalog,
        },
    },
    // lng: undefined,
    fallbackLng: "en",
    // load: "all",
    // preload: LANGUAGE_KEYS,
    // lowerCaseLng: false,
    // saveMissing: true,
    // missingKeyHandler: (lng, ns, key, fallbackValue, updateMissing, options) => {
    //     if (!options || !options.ignoreMissingKey) {
    //         winston.info('i18next missingKey: ' + key);
    //     }
    //     return key;
    // },
}).then((_t) => {
    // noop
}).catch((err) => {
    console.log(err);
});

const i18nextInstanceEN = i18nextInstance.cloneInstance();
i18nextInstanceEN.changeLanguage("en").then((_t) => {
    // noop
}).catch((err) => {
    console.log(err);
});

// can use ObjectValues or ObjectKeys from
// src/utils/object-keys-values.ts
// to benefit from compile-type TypeScript typesafe key enum
export const AvailableLanguages = {
    "en": "English",
    "fr": "Français",
    "fi": "Suomi",
    "de": "Deutsch",
    "es": "Español",
    "nl": "Dutch",
    "ja": "日本語",
    "ka": "ქართული",
    "lt": "Lietuvių",
    "pt-BR": "Português Brasileiro",
    "pt-PT": "Português",
    "zh-CN": "中文",
    "it": "Italiano",
    "ru": "Русский",
    "ko": "한국어",
    "sv": "Svenska",
};

interface LocalizedContent {
    [locale: string]: string;
}

export type I18nTyped = TFunction;

@injectable()
export class Translator {
    public translate: I18nTyped = this._translate;
    private locale = "en";

    public getLocale(): string {
        return this.locale;
    }

    public async setLocale(locale: string) {
        this.locale = locale;

        return new Promise<void>((resolve, reject) => {

            if (i18nextInstance.language !== this.locale) {
                // https://github.com/i18next/i18next/blob/master/CHANGELOG.md#1800
                // i18nextInstance.language not instantly ready (because async loadResources()),
                // but i18nextInstance.isLanguageChangingTo immediately informs which locale i18next is switching to.
                i18nextInstance.changeLanguage(this.locale).then((_t) => {
                    resolve();
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Translate content field that is not provided
     * by an i18n catalog
     * Field could be a string or an array
     *
     * @param text
     */
    public translateContentField(field: string | LocalizedContent) {
        if (!field) {
            return "";
        }

        if (typeof field === "string") {
            return field;
        }

        if (field[this.locale]) {
            return field[this.locale];
        }

        // Check if there is no composed locale names matching with the current locale
        const simplifiedFieldLocales = Object.keys(field).filter(
            (locale) => locale.split("-")[0] === this.locale.split("-")[0],
        );
        if (simplifiedFieldLocales.length) {
            return field[simplifiedFieldLocales[0]];
        }

        // If nothing try to take an english locale
        const englishFieldLocales = Object.keys(field).filter(
            (locale) => locale.split("-")[0] === "en",
        );
        if (englishFieldLocales.length) {
            return field[englishFieldLocales[0]];
        }

        // Take the first locale if nothing match with current locale or english
        const keys = Object.keys(field);

        if (keys && keys.length) {
            return field[keys[0]];
        }

        return "";
    }

    private _translate(message: string, options: any = {}): any { // TODO any?!
        const label = i18nextInstance.t(message, options);
        if (!label || !label.length) {
            return i18nextInstanceEN.t(message, options);
        }
        return label;
    }
}
