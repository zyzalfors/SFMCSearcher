import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/Components/Root/root.config";
import { RootComponent } from "./app/Components/Root/root.component";

bootstrapApplication(RootComponent, appConfig).catch(err => console.error(err));