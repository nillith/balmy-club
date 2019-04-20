import {Component, OnInit} from '@angular/core';
import {IService} from "../../services/i.service";
import {CircleModel, CircleModelModifier} from "../../models/circle.model";
import {appConstants} from "../../app.constants";
import {ToastService} from "../../services/toast.service";
import {isValidCircleName} from "../../../../shared/utils";
import {StringIds} from "../../modules/i18n/translations/string-ids";

@Component({
  selector: 'app-circles',
  templateUrl: './circles.component.html',
  styleUrls: ['./circles.component.scss']
})
export class CirclesComponent implements OnInit {

  readonly StringIds = StringIds;
  readonly appConstants = appConstants;

  constructor(private iService: IService, private toastService: ToastService) {
    this.circles = iService.circles;
  }

  circles: CircleModel[];

  loading = false;

  selectedCircle?: any;
  circleModifier?: CircleModelModifier;
  saveButtonText = StringIds.Save;

  setSelectCircle(circle: CircleModel) {
    const _this = this;
    _this.selectedCircle = circle;
    _this.circleModifier = circle.createModifier();
    _this.saveButtonText = _this.isCreatingNewCircle() ? StringIds.Create : StringIds.Save;
  }

  ngOnInit() {

  }

  isCreatingNewCircle() {
    const _this = this;
    return !!_this.selectedCircle && _this.selectedCircle.isNew();
  }

  onSelectCircle(i: number) {
    const _this = this;
    _this.setSelectCircle(_this.circles[i]);
  }

  createCircle() {
    const _this = this;
    if (!_this.isCreatingNewCircle()) {
      const circle = _this.iService.buildCircle();
      _this.setSelectCircle(circle);
    }
  }

  onRemoveUser(i: number) {
    const _this = this;
    _this.circleModifier.addToRemoveListByIndex(i);
  }

  cancelEdit() {
    const _this = this;
    _this.selectedCircle = null;
    _this.circleModifier = null;
  }

  async saveEdit() {
    const _this = this;
    try {
      const {circleModifier} = _this;
      if (!isValidCircleName(circleModifier.name)) {
        _this.toastService.showToast(`invalid circle name`);
      }
      _this.loading = true;
      circleModifier.commit();
      const {circle} = circleModifier;
      await circle.save();
      _this.loading = false;
      _this.setSelectCircle(circle);
      _this.toastService.showToast(`Succeed!`);
    } catch (e) {
      _this.toastService.showToast(e.message || e);
    }
  }
}
