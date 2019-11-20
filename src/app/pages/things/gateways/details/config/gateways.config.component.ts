import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Gateway } from 'app/common/interfaces/models';
import { Config } from 'app/common/interfaces/models';
import { ConfigContent, ConfigUpdate } from 'app/common/interfaces/models';
import { NotificationsService } from 'app/common/services/notifications/notifications.service';

import { BootstrapService } from 'app/common/services/bootstrap/bootstrap.service';

@Component({
  selector: 'ngx-gateways-config',
  templateUrl: './gateways.config.component.html',
  styleUrls: ['./gateways.config.component.scss'],
})
export class GatewaysConfigComponent implements OnInit, OnChanges {
  @Input() gateway: Gateway;

  content: ConfigContent = {
    log_level: '',
    http_port: '',
    mqtt_url: '',
    edgex_url: '',
    wowza_url: '',
  };

  constructor(
    private bootstrapService: BootstrapService,
    private notificationsService: NotificationsService,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (!this.gateway.metadata.gwPassword) {
      return;
    }

    this.bootstrapService.getConfig(this.gateway).subscribe(
      resp => {
        const cfg = <Config>resp;
        const content = JSON.parse(cfg.content);

        this.content = {
          log_level: content.log_level,
          http_port: content.http_port,
          mqtt_url: content.mqtt_url,
          edgex_url: content.edgex_url,
          wowza_url: content.wowza_url,
        };
      },
      err => {
        this.notificationsService.error(
          'Failed to get bootstrap configuration',
          `Error: ${err.status} - ${err.statusText}`);
      },
    );
  }

  submit() {
    const configUpdate: ConfigUpdate = {
      content: JSON.stringify(this.content),
      name: this.gateway.name,
    };

    this.bootstrapService.updateConfig(configUpdate, this.gateway).subscribe(
      resp => {
        this.notificationsService.success('Bootstrap configuration updated', '');
      },
      err => {
        this.notificationsService.error(
          'Failed to update bootstrap configuration',
          `Error: ${err.status} - ${err.statusText}`);
      },
    );
  }
}