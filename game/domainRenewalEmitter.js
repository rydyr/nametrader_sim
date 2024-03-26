export class DomainRenewalEmitter { constructor() { 
  this.renewalCount = 0; 
  } 
                                   emitDomainRenewalEvent() { 
    if (this.renewalCount < 3) {         console.log("[Domain Renewal]: Domain renewal notice: Your domain is about to expire!");     this.renewalCount++; 
    } 
  } 
}