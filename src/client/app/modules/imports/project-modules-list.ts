import {MarkdownModule} from "../markdown/markdown.module";
import {UserInfoModule} from "../user-info/user-info.module";
import {PostWidgetsModule} from "../post-widgets/post-widgets.module";
import {WidgetsModule} from "../widgets/widgets.module";
import {CommonPipesModule} from "../common-pipes/common-pipes.module";
import {I18nModule} from "../i18n/i18n.module";


export const projectModules = [
  MarkdownModule,
  UserInfoModule,
  PostWidgetsModule,
  WidgetsModule,
  CommonPipesModule,
  I18nModule,
];
