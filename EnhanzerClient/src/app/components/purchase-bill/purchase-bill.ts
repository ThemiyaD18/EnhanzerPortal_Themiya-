import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-bill',
  templateUrl: './purchase-bill.html',
  styleUrls: ['./purchase-bill.css'],
  standalone: false
})
export class PurchaseBill implements OnInit {
  itemForm: FormGroup;
  batches: string[] = [];

  // Autocomplete Array
  itemsList: string[] = ["Mango", "Apple", "Banana", "Orange", "Grapes", "Kiwi", "Strawberry"];
  filteredItems: string[] = [];

  // Table Data & Summary
  addedItems: any[] = [];
  totalItems = 0;
  totalQty = 0;
  grossTotal = 0;

  private apiUrl = 'https://localhost:7057/api/Locations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.itemForm = this.fb.group({
      item: ['', Validators.required],
      batch: ['', Validators.required],
      standardCost: [0, Validators.min(0)],
      standardPrice: [0, Validators.min(0)],
      margin: [0],
      qty: [1, [Validators.required, Validators.min(1)]],
      freeQty: [0],
      discount: [0],
      totalCost: [{ value: 0, disabled: true }],
      totalSelling: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    // Session check: ensure user is authenticated
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      this.router.navigate(['/']);
      return;
    }

    this.fetchBatches();

    // Autocomplete Filter Logic
    this.itemForm.get('item')?.valueChanges.subscribe(val => {
      if (val) {
        this.filteredItems = this.itemsList.filter(i => i.toLowerCase().includes(val.toLowerCase()));
      } else {
        this.filteredItems = [];
      }
    });

    // Dynamic Calculations
    this.itemForm.valueChanges.subscribe(val => {
      const sc = val.standardCost || 0;
      const sp = val.standardPrice || 0;
      const q = val.qty || 0;
      const d = val.discount || 0;

      const baseCost = sc * q;
      const discountAmt = baseCost * (d / 100);
      const finalCost = baseCost - discountAmt;
      const finalSelling = sp * q;

      this.itemForm.patchValue({
        totalCost: finalCost,
        totalSelling: finalSelling
      }, { emitEvent: false });
    });
  }

  fetchBatches(): void {
    this.http.get<string[]>(this.apiUrl).subscribe({
      next: (data) => this.batches = data,
      error: (err) => console.error('Error fetching batches:', err)
    });
  }

  selectItem(item: string): void {
    this.itemForm.patchValue({ item: item });
    this.filteredItems = [];
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      alert('Please fill out the Item, Batch, and Qty fields.');
      return;
    }

    this.addedItems.push(this.itemForm.getRawValue());
    this.calculateSummary();

    this.itemForm.reset({ qty: 1, standardCost: 0, standardPrice: 0, margin: 0, freeQty: 0, discount: 0 });
  }

  removeItem(index: number): void {
    this.addedItems.splice(index, 1);
    this.calculateSummary();
  }

  calculateSummary(): void {
    this.totalItems = this.addedItems.length;
    this.totalQty = this.addedItems.reduce((sum, current) => sum + (current.qty || 0), 0);
    this.grossTotal = this.addedItems.reduce((sum, current) => sum + (current.totalSelling || 0), 0);
  }

  // Session termination
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/']);
  }
}
