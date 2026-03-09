import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TabsRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';

@NgModule({
  declarations: [TabsPage],
  imports: [SharedModule, TabsRoutingModule]
})
export class TabsModule {}

