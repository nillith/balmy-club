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
    const self = this;
    self.selectedCircle = circle;
    self.circleModifier = circle.createModifier();
    self.saveButtonText = self.isCreatingNewCircle() ? StringIds.Create : StringIds.Save;
  }

  ngOnInit() {

  }

  isCreatingNewCircle() {
    const self = this;
    return !!self.selectedCircle && self.selectedCircle.isNew();
  }

  onSelectCircle(i: number) {
    const self = this;
    self.setSelectCircle(self.circles[i]);
  }

  createCircle() {
    const self = this;
    if (!self.isCreatingNewCircle()) {
      const circle = self.iService.buildCircle();
      self.setSelectCircle(circle);
    }
  }

  onRemoveUser(i: number) {
    const self = this;
    self.circleModifier.addToRemoveListByIndex(i);
  }

  cancelEdit() {
    const self = this;
    self.selectedCircle = null;
    self.circleModifier = null;
  }

  async saveEdit() {
    const self = this;
    try {
      const {circleModifier} = self;
      if (!isValidCircleName(circleModifier.name)) {
        self.toastService.showToast(`invalid circle name`);
      }
      self.loading = true;
      circleModifier.commit();
      const {circle} = circleModifier;
      await circle.save();
      self.loading = false;
      self.setSelectCircle(circle);
      self.toastService.showToast(`Succeed!`);
    } catch (e) {
      self.toastService.showToast(e.message || e);
    }
  }
}
