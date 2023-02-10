import "./toggleables/toggleableManager";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DefaultEventManager } from "@paperbits/common/events";
import { DefaultRouter, HistoryRouteHandler, LocationRouteHandler } from "@paperbits/common/routing";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { VisibilityGuard } from "@paperbits/common/user";
import { CarouselRuntimeModule } from "./carousel/carousel.runtime.module";
import { TabPanelRuntimeModule } from "./tabs/tabPanel.runtime.module";
import { MapRuntimeModule } from "./map/map.runtime.module";
import { SearchRuntimeModule } from "./search/search.runtime.module";
import { KnockoutRegistrationLoaders } from "./ko";
import { ConsoleLogger } from "@paperbits/common/logging";
import { Bag } from "@paperbits/common";
import { ComponentBinder } from "@paperbits/common/editing";
import { Dropdown } from "./dropdown/ko/dropdown";
import {DropdownContent } from "./dropdown/ko/dropdownContent";

export class CoreRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindInstance<Bag<ComponentBinder>>("componentBinders", {});
        injector.bindModule(new KnockoutRegistrationLoaders());
        injector.bindModule(new CarouselRuntimeModule());
        injector.bindModule(new TabPanelRuntimeModule());
        injector.bindModule(new MapRuntimeModule());
        injector.bindModule(new SearchRuntimeModule());
        injector.bindSingleton("logger", ConsoleLogger);
        injector.bindSingleton("eventManager", DefaultEventManager);
        injector.bindCollection("autostart");
        injector.bindCollection("routeGuards");
        injector.bindSingleton("router", DefaultRouter);
        injector.bind("httpClient", XmlHttpRequestClient);
        injector.bindToCollection("autostart", VisibilityGuard);
        injector.bindToCollection("autostart", location.href.includes("designtime=true")
            ? HistoryRouteHandler
            : LocationRouteHandler);

        injector.bind("dropdown", Dropdown);
        injector.bind("dropdownContent", DropdownContent);
    }
}
