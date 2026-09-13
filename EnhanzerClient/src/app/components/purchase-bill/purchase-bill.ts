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

  itemsList: string[] = ["Mango", "Apple", "Banana", "Orange", "Grapes", "Kiwi", "Strawberry"];
  filteredItems: string[] = [];

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
      // Only letters and spaces allowed
      item: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      batch: ['', Validators.required],
      // Only numbers with optional decimals allowed
      standardCost: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d+)?$/)]],
      standardPrice: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d+)?$/)]],
      margin: [null, [Validators.pattern(/^\d+(\.\d+)?$/)]],
      // Only strict whole numbers allowed
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

    this.itemForm.get('item')?.valueChanges.subscribe(val => {
      if (val) {
        this.filteredItems = this.itemsList.filter(i => i.toLowerCase().includes(val.toLowerCase()));
      } else {
        this.filteredItems = [];
      }
    });

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
      alert('Please fill out the form correctly. Ensure no invalid characters are used.');
      return;
    }

    this.addedItems.push(this.itemForm.getRawValue());
    this.calculateSummary();

    this.itemForm.reset({ qty: 1, standardCost: null, standardPrice: null, margin: null, freeQty: null, discount: null });
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

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/']);
  }
}
