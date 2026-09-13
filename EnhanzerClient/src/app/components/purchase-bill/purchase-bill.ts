import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  private apiUrl = 'https://localhost:7057/api/Locations';

  constructor(private fb: FormBuilder, private http: HttpClient) {
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

      // (Standard Cost * Quantity) - Discount%
      const baseCost = sc * q;
      const discountAmt = baseCost * (d / 100);
      const finalCost = baseCost - discountAmt;

      // Standard Price * Quantity
      const finalSelling = sp * q;

      this.itemForm.patchValue({
        totalCost: finalCost,
        totalSelling: finalSelling
      }, { emitEvent: false });
    });
  }

  fetchBatches() {
    this.http.get<string[]>(this.apiUrl).subscribe(data => this.batches = data);
  }

  selectItem(item: string) {
    this.itemForm.patchValue({ item: item });
    this.filteredItems = []; // Hide dropdown
  }

  addItem() {
    if (this.itemForm.invalid) {
      alert('Please fill out the Item, Batch, and Qty fields.');
      return;
    }

    this.addedItems.push(this.itemForm.getRawValue());

    // Update Summary Requirements
    this.totalItems = this.addedItems.length;
    this.totalQty = this.addedItems.reduce((sum, current) => sum + (current.qty || 0), 0);

    // Reset form for the next item
    this.itemForm.reset({ qty: 1, standardCost: 0, standardPrice: 0, margin: 0, freeQty: 0, discount: 0 });
  }

  removeItem(index: number) {
    this.addedItems.splice(index, 1);
    this.totalItems = this.addedItems.length;
    this.totalQty = this.addedItems.reduce((sum, current) => sum + (current.qty || 0), 0);
  }
}
