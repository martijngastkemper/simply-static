import GeneralSettings from "../pages/GeneralSettings";
import Diagnostics from "../pages/Diagnostics";
import Utilities from "../pages/Utilities";
import {useState, useEffect, useContext} from "@wordpress/element";
import {
    Flex,
    FlexItem,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorProvider as NavigatorProvider,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorScreen as NavigatorScreen,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalNavigatorButton as NavigatorButton,
    Button,
    Dashicon,
    Card,
    CardBody,
    Spinner,
    Notice,
    Animate
} from '@wordpress/components';
import DeploymentSettings from "../pages/DeploymentSettings";
import FormSettings from "../pages/FormSettings";
import SearchSettings from "../pages/SearchSettings";
import MiscSettings from "../pages/MiscSettings";
import Generate from "../pages/Generate";
import Optimize from "../pages/Optimize";
import {SettingsContext} from "../context/SettingsContext";
import apiFetch from "@wordpress/api-fetch";

const {__} = wp.i18n;

function SettingsPage() {
    const {isRunning, setIsRunning, blogId, settingsType, migrateSettings, saveSettings} = useContext(SettingsContext);
    const [activeItem, setActiveItem] = useState({activeItem: "/"});
    const [initialPage, setInitialPage] = useState(options.initial);
    const [initialSet, setInitialSet] = useState(false);
    const [disabledButton, setDisabledButton] = useState(false);

    useEffect(() => {
        if (!initialSet) {
            setInitialSet(true);
            setActiveItem(options.initial);
            setInitialPage(options.initial);
        }
    });

    const startExport = () => {
        setDisabledButton(true);

        apiFetch({
            path: '/simplystatic/v1/start-export',
            method: 'POST',
            data: {
                'blog_id': blogId,
                'is_network_admin': options.is_network,
                'settings_type': settingsType
            }
        }).then(resp => {
            setIsRunning(true);
        });
    }

    const cancelExport = () => {
        apiFetch({
            path: '/simplystatic/v1/cancel-export',
            method: 'POST',
            data: {
                'blog_id': blogId,
                'is_network_admin': options.is_network,
                'settings_type': settingsType
            }
        }).then(resp => {
            setIsRunning(false);
        });
    }

    const runMigrateSettings = () => {
        migrateSettings();
        saveSettings();
        location.reload();
    }

    useEffect(function () {
        setDisabledButton(isRunning);
    }, [isRunning])

    return (
        <div className={"plugin-settings-container"}>
            { 'yes' === options.need_upgrade ?
                <Animate type="slide-in" options={{origin: 'top'}}>
                    {() => (
                        <Notice status="warning" isDismissible={false} className={"migrate-notice"}>
                            <p>
                                {__('You have to migrate your settings to version 3.x of Simply Static to ensure everything works smoothly with the new interface.', 'simply-static')}
                            </p>
                            <Button onClick={runMigrateSettings}
                                    variant="primary">{__('Migrate settings', 'simply-static')}</Button>
                        </Notice>
                    )}
                </Animate>
                :
                ''
            }
            <NavigatorProvider initialPath={initialPage}>
                <Flex>
                    <FlexItem>
                        <Card className={"plugin-nav"}>
                            <div className={"plugin-logo"}>
                                <img alt="Logo"
                                     src={options.logo}/>
                            </div>
                            {/* eslint-disable-next-line no-undef */}
                            <p>Version: <b>{options.version}</b></p>
                            <div className={"generate-container"}>
                                <Button onClick={() => {
                                    startExport();
                                }}
                                        disabled={disabledButton}
                                        className={activeItem === '/' ? 'is-active-item generate' : 'generate'}
                                >
                                    {!disabledButton && [<Dashicon icon="update"/>,
                                        __('Generate Static Files', 'simply-static')
                                    ]}
                                    {disabledButton && [<Dashicon icon="update spin"/>,
                                        __('Generating...', 'simply-static'),
                                    ]}
                                </Button>
                                {disabledButton &&
                                    <span onClick={() => {
                                        cancelExport();
                                    }} className={"cancel-button"}>
                                            {__('Cancel Export', 'simply-static')}
                                        </span>
                                }
                            </div>
                            <CardBody>
                                <h4 className={"settings-headline"}> {__('Tools', 'simply-static')}</h4>
                                <NavigatorButton onClick={() => setActiveItem('/')}
                                                 className={activeItem === '/' ? 'is-active-item generate' : 'generate'}
                                                 path="/">
                                    <Dashicon icon="update"/> {__('Activity Log', 'simply-static')}
                                </NavigatorButton>
                                <NavigatorButton onClick={() => setActiveItem('/diagnostics')}
                                                 className={activeItem === '/diagnostics' ? 'is-active-item' : ''}
                                                 path="/diagnostics">
                                    <Dashicon icon="editor-help"/> {__('Diagnostics', 'simply-static')}
                                </NavigatorButton>
                            </CardBody>
                            <CardBody>
                                <h4 className={"settings-headline"}> {__('Settings', 'simply-static')}</h4>
                                <NavigatorButton onClick={() => setActiveItem('/general')}
                                                 className={activeItem === '/general' ? 'is-active-item' : ''}
                                                 path="/general">
                                    <Dashicon icon="admin-generic"/> {__('General', 'simply-static')}
                                </NavigatorButton>
                                {!options.is_network &&
                                    <NavigatorButton onClick={() => setActiveItem('/deployment')}
                                                     className={activeItem === '/deployment' ? 'is-active-item' : ''}
                                                     path="/deployment">
                                        <Dashicon icon="migrate"/> {__('Deployment', 'simply-static')}
                                    </NavigatorButton>
                                }
                                {'pro' === options.plan && !options.is_network &&
                                    <>
                                        <NavigatorButton onClick={() => setActiveItem('/forms')}
                                                         className={activeItem === '/forms' ? 'is-active-item' : ''}
                                                         path="/forms">
                                            <Dashicon icon="align-center"/> {__('Forms', 'simply-static')}
                                        </NavigatorButton>
                                        <NavigatorButton onClick={() => setActiveItem('/search')}
                                                         className={activeItem === '/search' ? 'is-active-item' : ''}
                                                         path="/search">
                                            <Dashicon icon="search"/> {__('Search', 'simply-static')}
                                        </NavigatorButton>
                                    </>
                                }
                            </CardBody>
                            <CardBody>
                                <h4 className={"settings-headline"}> {__('Advanced', 'simply-static')}</h4>
                                {'pro' === options.plan &&
                                    <NavigatorButton onClick={() => setActiveItem('/optimize')}
                                                     className={activeItem === '/optimize' ? 'is-active-item' : ''}
                                                     path="/optimize">
                                        <Dashicon icon="dashboard"/> {__('Optimize', 'simply-static')}
                                    </NavigatorButton>
                                }
                                <NavigatorButton onClick={() => setActiveItem('/utilities')}
                                                 className={activeItem === '/utilities' ? 'is-active-item' : ''}
                                                 path="/utilities">
                                    <Dashicon icon="admin-tools"/> {__('Utilities', 'simply-static')}
                                </NavigatorButton>
                                <NavigatorButton onClick={() => setActiveItem('/misc')}
                                                 className={activeItem === '/misc' ? 'is-active-item' : ''}
                                                 path="/misc">
                                    <Dashicon icon="block-default"/> {__('Misc', 'simply-static')}
                                </NavigatorButton>
                            </CardBody>
                            <CardBody>
                                <h4 className={"settings-headline"}>Simply Static</h4>
                                <Button href="https://simplystatic.com/changelogs/" target="_blank">
                                    <Dashicon icon="editor-ul"/> {__('Changelog', 'simply-static')}
                                </Button>
                                <Button href="https://simplystatic.com/docs/" target="_blank">
                                    <Dashicon icon="admin-links"/> {__('Documentation', 'simply-static')}
                                </Button>
                                {'free' === options.plan &&
                                    <Button href="https://simplystatic.com/simply-static-pro/" target="_blank">
                                        <Dashicon
                                            icon="admin-site-alt3"/>Simply Static Pro
                                    </Button>
                                }
                            </CardBody>
                        </Card>
                    </FlexItem>
                    {activeItem === '/' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/">
                                <div className={"plugin-settings"}>
                                    <Generate/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/diagnostics' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/diagnostics">
                                <div className={"plugin-settings"}>
                                    <Diagnostics/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/general' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/general">
                                <div className={"plugin-settings"}>
                                    <GeneralSettings/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/deployment' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/deployment">
                                <div className={"plugin-settings"}>
                                    <DeploymentSettings/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/forms' && 'pro' === options.plan &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/forms">
                                <div className={"plugin-settings"}>
                                    <FormSettings/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/search' && 'pro' === options.plan &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/search">
                                <div className={"plugin-settings"}>
                                    <SearchSettings/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/optimize' && 'pro' === options.plan &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/optimize">
                                <div className={"plugin-settings"}>
                                    <Optimize/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/utilities' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/utilities">
                                <div className={"plugin-settings"}>
                                    <Utilities/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                    {activeItem === '/misc' &&
                        <FlexItem isBlock={true}>
                            <NavigatorScreen path="/misc">
                                <div className={"plugin-settings"}>
                                    <MiscSettings/>
                                </div>
                            </NavigatorScreen>
                        </FlexItem>
                    }
                </Flex>
            </NavigatorProvider>
        </div>
    )
}

export default SettingsPage;