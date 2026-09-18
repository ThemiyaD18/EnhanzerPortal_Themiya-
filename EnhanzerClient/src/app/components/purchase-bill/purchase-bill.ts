import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';

export interface PurchaseOrder {
  purchaseOrderId?: number;
  netAmount: number;
  numberOfItems: number;
}

export interface PurchaseOrderItem {
  purchaseOrderId: number;
  itemName: string;
  quantity: number;
}

export interface ChartItemData {
  itemName: string;
  totalQuantity: number;
}

// Added to satisfy strict type checking for your form and table
export interface BillItem {
  item: string;
  batch: string;
  standardCost: number | null;
  standardPrice: number | null;
  margin: number | null;
  qty: number;
  freeQty: number | null;
  discount: number | null;
  totalCost: number;
  totalSelling: number;
}

@Component({
  selector: 'app-purchase-bill',
  templateUrl: './purchase-bill.html',
  styleUrls: ['./purchase-bill.css'],
  standalone: false
})
export class PurchaseBill implements OnInit {
  itemForm: FormGroup;
  batches: string[] = [];
  itemsList: string[] = ["Mango", "Apple", "Banana", "Orange", "Grapes", "Kiwi", "Strawberry"];
  filteredItems: string[] = [];
  addedItems: BillItem[] = [];
  totalItems = 0;
  totalQty = 0;
  grossTotal = 0;

  private baseApiUrl = 'https://localhost:7057/api/Locations';
  private widgetApiUrl = 'https://localhost:7057/api/Location'; 

  public newPurchaseOrder: PurchaseOrder = { netAmount: 0, numberOfItems: 0 };
  public latestOrders: PurchaseOrder[] = [];
  public oldestItems: PurchaseOrderItem[] = [];
  
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };
  public chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      item: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      batch: ['', Validators.required],
      standardCost: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d+)?$/)]],
      standardPrice: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d+)?$/)]],
      margin: [null, [Validators.pattern(/^\d+(\.\d+)?$/)]],
      qty: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      freeQty: [null, [Validators.pattern(/^\d+$/)]],
      discount: [null, [Validators.pattern(/^\d+(\.\d+)?$/)]],
      totalCost: [{ value: null, disabled: true }],
      totalSelling: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      this.router.navigate(['/']);
      return;
    }

    this.fetchBatches();
    this.loadDashboardWidgets();

    this.itemForm.get('item')?.valueChanges.subscribe((val: string | null) => {
      this.filteredItems = val ? this.itemsList.filter((i: string) => i.toLowerCase().includes(val.toLowerCase())) : [];
    });

    this.itemForm.valueChanges.subscribe((val: Partial<BillItem>) => {
      const sc = val.standardCost || 0;
      const sp = val.standardPrice || 0;
      const q = val.qty || 0;
      const d = val.discount || 0;

      const baseCost = sc * q;
      const finalCost = baseCost - (baseCost * (d / 100));
      const finalSelling = sp * q;

      this.itemForm.patchValue({ totalCost: finalCost, totalSelling: finalSelling }, { emitEvent: false });
    });
  }

  fetchBatches(): void {
    this.http.get<string[]>(this.baseApiUrl).subscribe({
      next: (data: string[]) => this.batches = data,
      error: (err: HttpErrorResponse) => console.error('Error fetching batches:', err)
    });
  }

  savePurchaseOrder(): void {
    this.http.post<PurchaseOrder>(`${this.widgetApiUrl}/SavePurchaseOrder`, this.newPurchaseOrder)
      .subscribe({
        next: (response: PurchaseOrder) => {
          console.log('Purchase order saved successfully', response);
          this.loadDashboardWidgets();
        },
        error: (error: HttpErrorResponse) => console.error('Error saving purchase order', error)
      });
  }

  loadDashboardWidgets(): void {
    this.http.get<PurchaseOrder[]>(`${this.widgetApiUrl}/GetLatestPurchaseOrders`)
      .subscribe({ next: (data: PurchaseOrder[]) => this.latestOrders = data || [], error: (err: HttpErrorResponse) => console.error(err) });

    this.http.get<PurchaseOrderItem[]>(`${this.widgetApiUrl}/GetOldestPurchaseOrderItems`)
      .subscribe({ next: (data: PurchaseOrderItem[]) => this.oldestItems = data || [], error: (err: HttpErrorResponse) => console.error(err) });

    this.http.get<ChartItemData[]>(`${this.widgetApiUrl}/GetItemQuantityDistribution`)
      .subscribe({
        next: (data: ChartItemData[]) => {
          if(data && data.length > 0) {
            this.chartData = {
              labels: data.map(d => d.itemName),
              datasets: [{
                data: data.map(d => d.totalQuantity),
                backgroundColor: ['#2E86C1', '#28B463', '#F1C40F', '#E74C3C', '#8E44AD']
              }]
            };
          }
        },
        error: (err: HttpErrorResponse) => console.error(err)
      });
  }

  selectItem(item: string): void {
    this.itemForm.patchValue({ item: item });
    this.filteredItems = [];
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }
    this.addedItems.push(this.itemForm.getRawValue() as BillItem);
    this.calculateSummary();
    this.itemForm.reset({ qty: 1, standardCost: null, standardPrice: null, margin: null, freeQty: null, discount: null });
  }

  removeItem(index: number): void {
    if (window.confirm('Are you sure you want to remove this item?')) {
      this.addedItems.splice(index, 1);
      this.calculateSummary();
    }
  }

  calculateSummary(): void {
    this.totalItems = this.addedItems.length;
    this.totalQty = this.addedItems.reduce((sum: number, current: BillItem) => sum + (current.qty || 0), 0);
    this.grossTotal = this.addedItems.reduce((sum: number, current: BillItem) => sum + (current.totalSelling || 0), 0);
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/']);
  }}

  
