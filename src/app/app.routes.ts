import { Routes } from '@angular/router';
import { RulesetCardView } from './rulesetCard/rulesetcardview.component';
import { RulesetView } from './rulesetReader/rulesetview.component';
import { CreateRuleset } from './createRuleset/createRuleset.component';
import { EditRuleset } from './editRuleset/editRuleset.component';
import { CreateUser } from './auth/createUserForm.component';
import { ConfirmUser } from './auth/confirmUserForm.component';
import { LoginUser } from './auth/loginForm.component';
import { ProfileView } from './profileView.component';

export const routes: Routes = [
    {path: '', component: RulesetCardView},
    {path: 'view/:id', component: RulesetView},
    {path: 'create', component: CreateRuleset},
    {path: 'edit/:id', component: EditRuleset},
    {path: 'create-account', component: CreateUser},
    {path: 'confirm-account', component: ConfirmUser},
    {path: 'login', component: LoginUser},
    {path: 'profile', component: ProfileView}
];
