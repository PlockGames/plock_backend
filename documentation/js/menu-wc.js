'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">plock_backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' : 'data-bs-target="#xs-controllers-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' :
                                            'id="xs-controllers-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/CommentsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentsController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/GameObjectsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GameObjectsController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/GamesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GamesController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/WinConditionsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WinConditionsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' : 'data-bs-target="#xs-injectables-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' :
                                        'id="xs-injectables-links-module-AppModule-25b8a4cca33771afdb326986221a450c209fde110d3ecbe27a25484b422dff26fbbaac0fdb3599f3a420455d22b37567b4d177248da9cb1dafca6e3fd57d3f0b"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/R2Service.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >R2Service</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});