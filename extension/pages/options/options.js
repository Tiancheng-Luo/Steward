/*global EXT_TYPE*/
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import './options.scss'
import changelog from '../../js/info/changelog'
import util from '../../js/common/util'
import { helpInfo } from '../../js/info/help'
import * as i18n from '../../js/info/i18n'
import CONST from '../../js/constant'
import WebsitesMixin from './mixins/websites'
import AdvancedMixin from './mixins/advanced'
import AppearanceMixin from './mixins/appearance'
import WallpapersMixin from './mixins/wallpapers'
import WorkflowsMixin from './mixins/workflows'
import PluginsMixin from './mixins/plugins'

const manifest = chrome.runtime.getManifest();
const version = manifest.version;
const extType = EXT_TYPE === 'alfred' ? 'Browser Alfred' : 'steward';
const storeId = extType === 'steward' ? 'dnkhdiodfglfckibnfcjbgddcgjgkacd' : 'jglmompgeddkbcdamdknmebaimldkkbl';

Vue.use(ElementUI);

const getConfig = util.getData('getConfig');

function init() {
    Promise.all([
        getConfig()
    ]).then(([config]) => {
        const tips = CONST.I18N.TIPS;

        config.lastVersion = config.version || version;

        const i18nTexts = getI18nTexts({general: config.general, tips});

        i18nTexts.ui = i18n;

        render(config, i18nTexts);
    });
}

function getI18nTexts(obj, prefix) {
    try {
        if (typeof obj === 'object' && !(obj instanceof Array)) {
            const ret = {};

            for (const key in obj) {
                const nextPrefix = prefix ? `${prefix}_${key}` : key;

                ret[key] = getI18nTexts(obj[key], nextPrefix);
            }
            return ret;
        } else {
            return chrome.i18n.getMessage(prefix)
        }
    } catch (e) {
        console.log(e);
        return {};
    }
}

function render({general, plugins, lastVersion}, i18nTexts) {
    let activeName = 'general';

    if (lastVersion < version) {
        activeName = 'update';
    }

    const fromTab = util.getParameterByName('tab');

    if (fromTab) {
        activeName = fromTab.toLowerCase();
    }

    new Vue({
        el: '#app',
        data: function() {
            return {
                activeGeneralConfigName: ['command'],
                activeName,
                changelog,
                extType,
                storeId,
                helpInfo,
                config: {
                    general,
                    plugins,
                    version
                },
                i18nTexts
            }
        },

        mounted: function() {
            if (activeName === 'update') {
                this.$nextTick(() => {
                    this.saveConfig(true);
                });
            }
            this.initTab(this.activeName);
        },

        mixins: [
            WebsitesMixin,
            AdvancedMixin,
            AppearanceMixin,
            WallpapersMixin,
            WorkflowsMixin,
            PluginsMixin
        ],

        methods: {
            initTab(tabname) {
                if (tabname === 'wallpapers') {
                    this.loadWallpapersIfNeeded();
                } else if (tabname === 'appearance') {
                    if (!this.curApprItem) {
                        this.loadThemes().then(() => {
                            this.updateApprItem(this.appearanceItems[0]);
                        });
                    } else {
                        this.applyTheme(this.themeMode);
                    }
                } else if (tabname === 'workflows') {
                    this.loadWorkflowsIfNeeded();
                } else if (tabname === 'advanced') {
                    this.initAdvancedIfNeeded();
                }
            },
            handleTabClick: function(tab) {
                this.initTab(tab.name);
            },

            saveConfig: function(silent) {
                const that = this;
                const newConfig = JSON.parse(JSON.stringify(this.config));

                chrome.storage.sync.set({
                    [CONST.STORAGE.CONFIG]: newConfig
                }, function() {
                    if (silent) {
                        console.log('save successfully');
                    } else {
                        that.$message('save successfully!');
                    }
                });
            },

            handleGeneralSubmit: function() {
                this.saveConfig();
            }
        }
    });
}

init();